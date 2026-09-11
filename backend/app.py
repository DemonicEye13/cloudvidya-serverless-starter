"""
EventHub backend — a single Lambda function that routes every request
itself, built on top of the CloudVidya Day 2 "Backend walkthrough" pattern.

Theme: EventHub — register students for college activities and events.
Target users: event organizers (create/manage events, confirm or cancel
registrations) and attendees (browse events, register for one).

Routes:
  GET    /health          -> confirm the API is running
  POST   /items           -> register a student for an event (create a registration)
  GET    /items           -> list all registrations (organizer dashboard / event feed)
  PATCH  /items/{id}      -> update a registration's status (organizer action —
                              CONFIRMED / CANCELLED / ATTENDED)

Environment variables (set by template.yaml, read here):
  TABLE_NAME  -> the DynamoDB table this function reads/writes
"""

import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Attr

TABLE_NAME = os.environ.get("TABLE_NAME")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME) if TABLE_NAME else None

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
}

# Registration lifecycle. Organizers move a registration through these
# states from the dashboard; PENDING is the default on sign-up.
VALID_STATUSES = {"PENDING", "CONFIRMED", "CANCELLED", "ATTENDED"}

# Event categories shown in the frontend's dropdown (frontend/config.js
# should mirror this list so the UI and backend agree).
VALID_CATEGORIES = {
    "Workshop",
    "Seminar",
    "Cultural",
    "Sports",
    "Technical",
    "Competition",
    "Other",
}


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


def _health():
    return _response(200, {"status": "ok", "table": TABLE_NAME})


def _register_for_event(event):
    """POST /items — a student registers for a college event."""
    try:
        payload = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "Request body must be valid JSON."})

    event_title = (payload.get("eventTitle") or "").strip()
    description = (payload.get("description") or "").strip()
    category = (payload.get("category") or "Other").strip()
    student_name = (payload.get("studentName") or "").strip()
    student_email = (payload.get("studentEmail") or "").strip()
    event_date = (payload.get("eventDate") or "").strip()
    venue = (payload.get("venue") or "").strip()

    if not event_title or not student_name:
        return _response(
            400, {"error": "Both 'eventTitle' and 'studentName' are required."}
        )

    if category not in VALID_CATEGORIES:
        category = "Other"

    item = {
        "id": str(uuid.uuid4()),
        "eventTitle": event_title,
        "description": description,
        "category": category,
        "studentName": student_name,
        "studentEmail": student_email,
        "eventDate": event_date,
        "venue": venue,
        "status": "PENDING",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    table.put_item(Item=item)

    # Shows up in CloudWatch — handy for the "Testing and troubleshooting"
    # session and for demoing the flow end to end.
    print(f"New registration: {json.dumps(item)}")

    return _response(200, {"message": "Registered", "item": item})


def _list_registrations(event):
    """GET /items — list registrations, optionally filtered by status or category.

    Supports optional query string params:
      ?status=CONFIRMED
      ?category=Workshop
    """
    params = (event.get("queryStringParameters") or {}) if event else {}
    status_filter = (params or {}).get("status")
    category_filter = (params or {}).get("category")

    scan_kwargs = {"Limit": 100}
    filter_expr = None
    if status_filter:
        filter_expr = Attr("status").eq(status_filter)
    if category_filter:
        cat_expr = Attr("category").eq(category_filter)
        filter_expr = cat_expr if filter_expr is None else (filter_expr & cat_expr)
    if filter_expr is not None:
        scan_kwargs["FilterExpression"] = filter_expr

    result = table.scan(**scan_kwargs)
    items = sorted(
        result.get("Items", []), key=lambda i: i.get("createdAt", ""), reverse=True
    )
    return _response(200, {"items": items})


def _update_registration_status(event):
    """PATCH /items/{id} — organizer confirms, cancels, or marks attendance."""
    path_params = event.get("pathParameters") or {}
    reg_id = path_params.get("id")
    if not reg_id:
        return _response(400, {"error": "Missing registration id in path."})

    try:
        payload = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "Request body must be valid JSON."})

    new_status = (payload.get("status") or "").strip().upper()
    if new_status not in VALID_STATUSES:
        return _response(
            400,
            {"error": f"'status' must be one of {sorted(VALID_STATUSES)}."},
        )

    result = table.update_item(
        Key={"id": reg_id},
        UpdateExpression="SET #s = :status",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":status": new_status},
        ReturnValues="ALL_NEW",
    )

    updated_item = result.get("Attributes")
    if not updated_item:
        return _response(404, {"error": f"No registration found with id {reg_id}."})

    print(f"Updated registration {reg_id} -> {new_status}")
    return _response(200, {"message": "Updated", "item": updated_item})


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    # API Gateway sends a CORS preflight OPTIONS request before every
    # POST/PATCH from a browser — always answer it, or the browser will
    # block the real request before it's even sent.
    if method == "OPTIONS":
        return _response(200, {})

    if resource == "/health" and method == "GET":
        return _health()

    if resource == "/items" and method == "POST":
        return _register_for_event(event)

    if resource == "/items" and method == "GET":
        return _list_registrations(event)

    if resource == "/items/{id}" and method == "PATCH":
        return _update_registration_status(event)

    return _response(404, {"error": f"No route for {method} {resource}"})
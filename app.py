import csv
import io
import re
import ssl
import smtplib
import threading
import uuid

from email.message import EmailMessage

from flask import (
    Flask,
    jsonify,
    render_template,
    request
)


app = Flask(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024

app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE


# =========================================================
# IN-MEMORY JOBS
# =========================================================

jobs = {}

jobs_lock = threading.Lock()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def index():

    return render_template(
        "index.html"
    )


# =========================================================
# EMAIL VALIDATION
# =========================================================

def validate_email(email):

    pattern = (
        r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )

    return re.match(
        pattern,
        email
    ) is not None


# =========================================================
# TEMPLATE VARIABLES
# =========================================================

def personalize(text, candidate):

    def replace(match):

        key = match.group(1).strip()

        value = candidate.get(
            key,
            ""
        )

        if value is None:
            return ""

        return str(value)

    return re.sub(
        r"{{\s*([^{}]+)\s*}}",
        replace,
        text
    )


# =========================================================
# PARSE MULTIPLE EMAILS
# =========================================================

def parse_recipients(value):

    if not value:
        return []

    value = value.replace(
        ";",
        ","
    )

    emails = []

    for item in value.split(","):

        email = item.strip()

        if email:

            emails.append(
                email
            )

    return emails


# =========================================================
# READ CSV
# =========================================================

def read_csv(file):

    raw = file.read()

    if len(raw) > MAX_FILE_SIZE:

        raise ValueError(
            "CSV file is too large. Maximum size is 5 MB."
        )

    try:

        text = raw.decode(
            "utf-8-sig"
        )

    except UnicodeDecodeError:

        raise ValueError(
            "CSV must be UTF-8 encoded."
        )


    reader = csv.DictReader(
        io.StringIO(text)
    )


    if not reader.fieldnames:

        raise ValueError(
            "CSV does not contain headers."
        )


    reader.fieldnames = [

        header.strip()

        for header in reader.fieldnames

        if header
    ]


    if (
        "email" not in reader.fieldnames
        and
        "emails" not in reader.fieldnames
    ):

        raise ValueError(
            "CSV must contain an 'email' or 'emails' column."
        )


    candidates = []


    for row in reader:

        candidate = {}

        for key, value in row.items():

            if key:

                candidate[
                    key.strip()
                ] = (
                    str(value).strip()
                    if value is not None
                    else ""
                )


        email_value = candidate.get(
            "email",
            ""
        )


        if not email_value:

            email_value = candidate.get(
                "emails",
                ""
            )


        recipients = parse_recipients(
            email_value
        )


        if not recipients:

            continue


        candidate["_recipients"] = (
            recipients
        )


        candidates.append(
            candidate
        )


    if not candidates:

        raise ValueError(
            "No candidates with valid email values were found."
        )


    return candidates


# =========================================================
# SMTP SEND
# =========================================================

def send_email(
    smtp_host,
    smtp_port,
    username,
    password,
    from_email,
    to_email,
    subject,
    body
):

    message = EmailMessage()


    message["From"] = (
        from_email
        or username
    )

    message["To"] = to_email

    message["Subject"] = subject


    message.set_content(
        body
    )


    context = ssl.create_default_context()


    with smtplib.SMTP_SSL(
        smtp_host,
        smtp_port,
        context=context
    ) as server:

        server.login(
            username,
            password
        )

        server.send_message(
            message
        )


# =========================================================
# SMTP CONNECTION TEST
# =========================================================

@app.route(
    "/api/test-email",
    methods=["POST"]
)
def test_email():

    data = request.get_json(
        silent=True
    ) or {}


    smtp_host = data.get(
        "smtp_host",
        "smtp.gmail.com"
    ).strip()


    smtp_port = int(
        data.get(
            "smtp_port",
            465
        )
    )


    username = data.get(
        "username",
        ""
    ).strip()


    password = data.get(
        "password",
        ""
    )


    from_email = data.get(
        "from_email",
        ""
    ).strip()


    if not username:

        return jsonify({
            "success": False,
            "error":
                "Email address is required."
        }), 400


    if not password:

        return jsonify({
            "success": False,
            "error":
                "Email password or app password is required."
        }), 400


    try:

        context = ssl.create_default_context()


        with smtplib.SMTP_SSL(
            smtp_host,
            smtp_port,
            context=context
        ) as server:

            server.login(
                username,
                password
            )


        return jsonify({
            "success": True,
            "message":
                "SMTP connection successful."
        })


    except Exception as exc:

        return jsonify({
            "success": False,
            "error":
                str(exc)
        }), 400


# =========================================================
# START EMAIL JOB
# =========================================================

@app.route(
    "/api/send",
    methods=["POST"]
)
def start_send():

    try:

        uploaded_file = request.files.get(
            "csv_file"
        )


        if not uploaded_file:

            return jsonify({
                "error":
                    "Please upload a CSV file."
            }), 400


        # -------------------------------------------------
        # SMTP DATA
        # -------------------------------------------------

        smtp_host = request.form.get(
            "smtp_host",
            "smtp.gmail.com"
        ).strip()


        smtp_port = int(
            request.form.get(
                "smtp_port",
                465
            )
        )


        username = request.form.get(
            "username",
            ""
        ).strip()


        password = request.form.get(
            "password",
            ""
        )


        from_email = request.form.get(
            "from_email",
            ""
        ).strip()


        # -------------------------------------------------
        # EMAIL
        # -------------------------------------------------

        subject = request.form.get(
            "subject",
            ""
        ).strip()


        body = request.form.get(
            "body",
            ""
        ).strip()


        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not username:

            return jsonify({
                "error":
                    "Sending email is required."
            }), 400


        if not password:

            return jsonify({
                "error":
                    "Email password or app password is required."
            }), 400


        if not subject:

            return jsonify({
                "error":
                    "Email subject is required."
            }), 400


        if not body:

            return jsonify({
                "error":
                    "Email body is required."
            }), 400


        # -------------------------------------------------
        # READ CSV
        # -------------------------------------------------

        candidates = read_csv(
            uploaded_file
        )


        # -------------------------------------------------
        # CREATE JOB
        # -------------------------------------------------

        job_id = str(
            uuid.uuid4()
        )


        jobs[job_id] = {

            "status":
                "queued",

            "total":
                0,

            "completed":
                0,

            "sent":
                0,

            "failed":
                0,

            "cancelled":
                False,

            "results":
                []

        }


        # -------------------------------------------------
        # START WORKER
        # -------------------------------------------------

        worker = threading.Thread(

            target=send_job,

            args=(

                job_id,

                candidates,

                smtp_host,

                smtp_port,

                username,

                password,

                from_email,

                subject,

                body

            ),

            daemon=True

        )


        worker.start()


        return jsonify({

            "success":
                True,

            "job_id":
                job_id

        })


    except ValueError as exc:

        return jsonify({

            "error":
                str(exc)

        }), 400


    except Exception as exc:

        return jsonify({

            "error":
                str(exc)

        }), 500


# =========================================================
# EMAIL WORKER
# =========================================================

def send_job(
    job_id,
    candidates,
    smtp_host,
    smtp_port,
    username,
    password,
    from_email,
    subject,
    body
):

    # -----------------------------------------------------
    # BUILD RECIPIENT LIST
    # -----------------------------------------------------

    recipients = []


    for candidate in candidates:

        for email in candidate[
            "_recipients"
        ]:

            recipients.append({

                "email":
                    email,

                "candidate":
                    candidate

            })


    total = len(
        recipients
    )


    with jobs_lock:

        jobs[job_id][
            "total"
        ] = total

        jobs[job_id][
            "status"
        ] = "sending"


    # -----------------------------------------------------
    # SEND
    # -----------------------------------------------------

    for item in recipients:

        with jobs_lock:

            if jobs[job_id][
                "cancelled"
            ]:

                jobs[job_id][
                    "status"
                ] = "cancelled"

                break


        email = item[
            "email"
        ]

        candidate = item[
            "candidate"
        ]


        # -------------------------------------------------
        # VALIDATE
        # -------------------------------------------------

        if not validate_email(
            email
        ):

            with jobs_lock:

                jobs[job_id][
                    "failed"
                ] += 1

                jobs[job_id][
                    "completed"
                ] += 1

                jobs[job_id][
                    "results"
                ].append({

                    "email":
                        email,

                    "name":
                        candidate.get(
                            "name",
                            ""
                        ),

                    "status":
                        "failed",

                    "message":
                        "Invalid email address."

                })

            continue


        # -------------------------------------------------
        # PERSONALIZE
        # -------------------------------------------------

        personalized_subject = (
            personalize(
                subject,
                candidate
            )
        )


        personalized_body = (
            personalize(
                body,
                candidate
            )
        )


        # -------------------------------------------------
        # SEND
        # -------------------------------------------------

        try:

            send_email(

                smtp_host,

                smtp_port,

                username,

                password,

                from_email,

                email,

                personalized_subject,

                personalized_body

            )


            with jobs_lock:

                jobs[job_id][
                    "sent"
                ] += 1

                jobs[job_id][
                    "completed"
                ] += 1

                jobs[job_id][
                    "results"
                ].append({

                    "email":
                        email,

                    "name":
                        candidate.get(
                            "name",
                            ""
                        ),

                    "status":
                        "sent",

                    "message":
                        "Email sent successfully."

                })


        except Exception as exc:

            with jobs_lock:

                jobs[job_id][
                    "failed"
                ] += 1

                jobs[job_id][
                    "completed"
                ] += 1

                jobs[job_id][
                    "results"
                ].append({

                    "email":
                        email,

                    "name":
                        candidate.get(
                            "name",
                            ""
                        ),

                    "status":
                        "failed",

                    "message":
                        str(exc)

                })


    # -----------------------------------------------------
    # FINISHED
    # -----------------------------------------------------

    with jobs_lock:

        if jobs[job_id][
            "status"
        ] != "cancelled":

            jobs[job_id][
                "status"
            ] = "completed"


# =========================================================
# JOB STATUS
# =========================================================

@app.route(
    "/api/jobs/<job_id>"
)
def job_status(job_id):

    with jobs_lock:

        job = jobs.get(
            job_id
        )


        if not job:

            return jsonify({
                "error":
                    "Job not found."
            }), 404


        total = job[
            "total"
        ]

        completed = job[
            "completed"
        ]


        if total:

            progress = round(
                (
                    completed /
                    total
                ) * 100
            )

        else:

            progress = 0


        return jsonify({

            "status":
                job["status"],

            "total":
                total,

            "completed":
                completed,

            "sent":
                job["sent"],

            "failed":
                job["failed"],

            "progress":
                progress,

            "results":
                job["results"]

        })


# =========================================================
# CANCEL JOB
# =========================================================

@app.route(
    "/api/jobs/<job_id>/cancel",
    methods=["POST"]
)
def cancel_job(job_id):

    with jobs_lock:

        job = jobs.get(
            job_id
        )


        if not job:

            return jsonify({
                "error":
                    "Job not found."
            }), 404


        job[
            "cancelled"
        ] = True


    return jsonify({
        "success":
            True
    })


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
        threaded=True
    )

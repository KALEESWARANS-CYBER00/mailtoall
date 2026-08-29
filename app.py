import os
import io
import csv
from flask import Flask, render_template, request, jsonify, Response, send_from_directory
from config import Config
from services.smtp_service import test_smtp_connection, send_email_message
from services.csv_service import process_csv_file
from services.template_service import render_email_content
from services.campaign_service import start_campaign
from services.job_service import get_job, set_job_status, update_job

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config.from_object(Config)


# =========================================================
# HTML UI & REACT SPA ROUTES (Stateless Navigation)
# =========================================================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path.startswith('api/'):
        return jsonify({"error": "API route not found"}), 404
    
    dist_dir = os.path.join(app.root_path, 'frontend', 'dist')
    file_path = os.path.join(dist_dir, path)
    
    # If the file exists on the disk (e.g. assets/index.js, favicon.ico), serve it
    if path and os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(dist_dir, path)
        
    # Otherwise fall back to index.html for React SPA client-side routes
    if os.path.exists(os.path.join(dist_dir, 'index.html')):
        return send_from_directory(dist_dir, 'index.html')
    return jsonify({"error": "Frontend build not found. Please build the React app."}), 404




# =========================================================
# API ENDPOINTS
# =========================================================

@app.route('/api/smtp/test', methods=['POST'])
def api_test_smtp():
    data = request.get_json(silent=True) or {}
    smtp_host = data.get('smtp_host', '')
    smtp_port = data.get('smtp_port', 465)
    username = data.get('username', '')
    password = data.get('password', '')
    security = data.get('security', 'SSL')

    if not username or not password:
        return jsonify({
            "success": False,
            "error": "SMTP Username and Password are required."
        }), 400

    success, message = test_smtp_connection(smtp_host, smtp_port, username, password, security)
    if success:
        return jsonify({"success": True, "message": message})
    return jsonify({"success": False, "error": message}), 400


@app.route('/api/csv/preview', methods=['POST'])
def api_csv_preview():
    if 'csv_file' not in request.files:
        return jsonify({"success": False, "error": "Please select a CSV file to upload."}), 400

    uploaded_file = request.files['csv_file']
    if not uploaded_file or uploaded_file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    try:
        results = process_csv_file(uploaded_file)
        results["success"] = True
        return jsonify(results)
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"success": False, "error": f"Failed to process CSV file: {str(exc)}"}), 500


@app.route('/api/campaigns/preview', methods=['POST'])
def api_campaign_preview():
    data = request.get_json(silent=True) or {}
    template_subject = data.get('template_subject', '')
    template_body = data.get('template_body', '')
    recipient_data = data.get('recipient_data', {})

    rendered_subject, rendered_body = render_email_content(template_subject, template_body, recipient_data)
    return jsonify({
        "success": True,
        "subject": rendered_subject,
        "body": rendered_body
    })


@app.route('/api/campaigns/test', methods=['POST'])
def api_campaign_test_send():
    data = request.get_json(silent=True) or {}
    smtp_config = data.get('smtp_config', {})
    template_subject = data.get('template_subject', '')
    template_body = data.get('template_body', '')
    test_email = data.get('test_email', '').strip()
    recipient_data = data.get('recipient_data', {})
    is_html = data.get('is_html', False)

    if not test_email:
        return jsonify({"success": False, "error": "Test email address is required."}), 400

    rendered_subject, rendered_body = render_email_content(template_subject, template_body, recipient_data)

    try:
        send_email_message(
            smtp_config=smtp_config,
            to_email=test_email,
            subject=f"[TEST] {rendered_subject}",
            body=rendered_body,
            is_html=is_html
        )
        return jsonify({
            "success": True,
            "message": f"✓ Test email sent successfully to {test_email}"
        })
    except Exception as exc:
        return jsonify({"success": False, "error": f"✕ Test email failed: {str(exc)}"}), 400


@app.route('/api/campaigns/send', methods=['POST'])
def api_campaign_send():
    data = request.get_json(silent=True) or {}
    recipients = data.get('recipients', [])
    smtp_config = data.get('smtp_config', {})
    subject = data.get('subject', '')
    body = data.get('body', '')
    is_html = data.get('is_html', False)
    speed = data.get('speed', 'normal')
    custom_rate = data.get('custom_rate', 30)

    try:
        job_id, job_data = start_campaign(
            recipients=recipients,
            smtp_config=smtp_config,
            subject=subject,
            body=body,
            is_html=is_html,
            speed=speed,
            custom_rate=custom_rate
        )
        return jsonify({
            "success": True,
            "job_id": job_id,
            "job": {
                "status": job_data["status"],
                "total": job_data["total"],
                "progress": 0
            }
        })
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"success": False, "error": f"Failed to launch campaign: {str(exc)}"}), 500


@app.route('/api/jobs/<job_id>', methods=['GET'])
def api_get_job_status(job_id):
    job = get_job(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found or expired."}), 404

    # Sanitize password from API response
    sanitized_job = dict(job)
    if "smtp_config" in sanitized_job:
        sanitized_job["smtp_config"] = dict(sanitized_job["smtp_config"])
        sanitized_job["smtp_config"]["password"] = "******"

    return jsonify({
        "success": True,
        "job": sanitized_job
    })


@app.route('/api/jobs/<job_id>/pause', methods=['POST'])
def api_pause_job(job_id):
    job = get_job(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404

    set_job_status(job_id, "paused")
    return jsonify({"success": True, "message": "Campaign paused."})


@app.route('/api/jobs/<job_id>/resume', methods=['POST'])
def api_resume_job(job_id):
    job = get_job(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404

    set_job_status(job_id, "sending")
    return jsonify({"success": True, "message": "Campaign resumed."})


@app.route('/api/jobs/<job_id>/cancel', methods=['POST'])
def api_cancel_job(job_id):
    job = get_job(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404

    set_job_status(job_id, "cancelled")
    return jsonify({"success": True, "message": "Campaign cancelled."})


@app.route('/api/jobs/<job_id>/results', methods=['GET'])
def api_job_results(job_id):
    job = get_job(job_id)
    if not job:
        return jsonify({"success": False, "error": "Job not found."}), 404

    fmt = request.args.get('format', 'json')
    if fmt == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Email', 'Name', 'Status', 'Message', 'Sent At'])
        for r in job.get('results', []):
            writer.writerow([r.get('email'), r.get('name'), r.get('status'), r.get('message'), r.get('sent_at')])
        
        output.seek(0)
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment;filename=campaign_results_{job_id[:8]}.csv"}
        )

    return jsonify({
        "success": True,
        "results": job.get('results', []),
        "summary": {
            "total": job.get('total', 0),
            "successful": job.get('successful', 0),
            "failed": job.get('failed', 0),
            "status": job.get('status')
        }
    })


if __name__ == '__main__':
    import os, socket
    port = int(os.environ.get('PORT', 5000))
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    is_busy = sock.connect_ex(('127.0.0.1', port)) == 0
    sock.close()
    if is_busy and 'PORT' not in os.environ:
        port = 5005
    print(f"Starting MailFlow Flask Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)

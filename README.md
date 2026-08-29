# MailToAll (MailFlow) - Bulk Personalized Email Sender

MailToAll is a lightweight, asynchronous Python Flask web application designed for sending personalized bulk emails via custom SMTP servers (such as Gmail SSL SMTP). It features CSV recipient importing with dynamic field substitution, live progress monitoring, background task execution, and job cancellation.

---

## 🚀 Features

- **CSV Import & Dynamic Variable Personalization**: Upload CSV files containing contact records. Automatically maps columns to template placeholders like `{{ name }}`, `{{ company }}`, or `{{ role }}` in both the subject and email body.
- **Multi-Recipient Support**: Supports multiple comma- or semicolon-separated email addresses per CSV row (`email` or `emails` column).
- **Asynchronous Background Processing**: Dispatches emails concurrently using Python multi-threading (`threading.Thread`) without blocking the web application server.
- **Live Job Tracking & Cancellation**: Monitor real-time sending progress, success/failure counts, per-recipient status logs, and cancel queued/in-flight jobs at any time.
- **SMTP Verification Endpoint**: Test SMTP connection and authentication credentials before launching email campaigns.
- **Deployment Ready**: Fully configured for production deployment on cloud services like Render with Gunicorn.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, Flask 3.1.1, `smtplib` (SSL), `threading`
- **WSGI Server**: Gunicorn 23.0.0
- **Frontend**: HTML5, CSS3, JavaScript (Flask Templates)
- **Deployment**: Render (`render.yaml`), Docker/Linux compatible

---

## 📁 Project Structure

```
mailtoall/
├── app.py              # Main Flask application, API endpoints & worker thread logic
├── requirements.txt    # Python dependencies (Flask, Gunicorn)
├── render.yaml         # Cloud deployment configuration for Render
├── create.csv          # Sample CSV template for mail merge
├── templates/
│   └── index.html      # Responsive frontend Web UI
└── venv/               # Python Virtual Environment
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
- Python 3.10+
- `pip` package manager

### 2. Clone Repository & Setup Virtual Environment
```bash
git clone <repository-url>
cd mailtoall

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Application
```bash
python app.py
```
The application will start on `http://localhost:5000`.

---

## 📋 CSV Format Guidelines

Your CSV file must include an `email` (or `emails`) column. Any additional columns can be referenced as dynamic variables in your template.

### Example CSV (`create.csv`):
```csv
name,email,company,role
Alice Johnson,alice@example.com,TechCorp,Software Engineer
Bob Smith,bob@example.com;bob.smith@work.com,InnoLabs,Product Manager
```

### Dynamic Templating Syntax
Use double curly braces `{{ column_name }}` in the subject or body:
- **Subject**: `Application Update for {{ name }}`
- **Body**: `Hi {{ name }}, We were impressed by your work at {{ company }} for the {{ role }} position...`

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Renders main Web UI dashboard |
| `/api/test-email` | `POST` | Validates SMTP server host, port, username, and password |
| `/api/send` | `POST` | Accepts CSV file, SMTP info, email subject/body; spawns sending job |
| `/api/jobs/<job_id>` | `GET` | Returns job progress status (`queued`, `sending`, `completed`, `cancelled`), progress percentage, and log results |
| `/api/jobs/<job_id>/cancel` | `POST` | Signals worker thread to stop processing remaining recipients |

---

## 🌐 Deployment (Render)

The project includes a `render.yaml` specification file ready for Render Web Services.

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Python Version**: `3.11.11`

---

## 🔒 Security Best Practices

- **App Passwords**: For Gmail/Google Workspace users, generate and use an **App Password** instead of your primary account password.
- **File Upload Limits**: Configured with a 5 MB maximum file payload limit (`MAX_CONTENT_LENGTH`).

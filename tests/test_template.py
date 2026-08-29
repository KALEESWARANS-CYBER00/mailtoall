from services.template_service import render_template_string, render_email_content

def test_template_variable_replacement():
    template = "Hello {{ name }}, welcome to {{ company }}!"
    data = {"name": "Alice", "company": "Acme"}
    res = render_template_string(template, data)
    assert res == "Hello Alice, welcome to Acme!"

def test_template_missing_variable_fallback():
    template = "Hi {{ name }}, your role is {{ role }}."
    data = {"name": "Bob"}
    res = render_template_string(template, data, fallback="N/A")
    assert res == "Hi Bob, your role is N/A."

def test_template_safety():
    # Verify template does not execute python code or SSTI injection payloads
    template = "Hello {{ __import__('os').system('whoami') }}"
    data = {"name": "Alice"}
    res = render_template_string(template, data)
    # Payload should be rendered safely as empty/fallback string or literal key lookup, not code execution
    assert res == "Hello "

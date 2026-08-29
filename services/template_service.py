import re
import html

VARIABLE_PATTERN = re.compile(r"{{\s*([^{}]+)\s*}}")

def render_template_string(template_text, data, fallback="", escape_html=False):
    if not template_text:
        return ""

    def replace_var(match):
        raw_key = match.group(1).strip()
        key = raw_key
        default_val = fallback

        # Support default filter syntax e.g. {{ name | default('there') }}
        if '|' in raw_key:
            parts = raw_key.split('|', 1)
            key = parts[0].strip()
            filter_part = parts[1].strip()
            if 'default(' in filter_part:
                def_match = re.search(r"default\(['\"]?(.*?)['\"]?\)", filter_part)
                if def_match:
                    default_val = def_match.group(1)

        val = data.get(key)
        if val is None:
            # Case-insensitive fallback check
            for data_key, data_val in data.items():
                if data_key.lower() == key.lower() and data_val is not None:
                    val = data_val
                    break

        if val is None or str(val).strip() == "":
            res_str = str(default_val)
        else:
            res_str = str(val)

        if escape_html:
            res_str = html.escape(res_str)

        return res_str

    return VARIABLE_PATTERN.sub(replace_var, template_text)


def render_email_content(template_subject, template_body, recipient_data, fallback=""):
    rendered_subject = render_template_string(template_subject, recipient_data, fallback=fallback)
    rendered_body = render_template_string(template_body, recipient_data, fallback=fallback)
    return rendered_subject, rendered_body

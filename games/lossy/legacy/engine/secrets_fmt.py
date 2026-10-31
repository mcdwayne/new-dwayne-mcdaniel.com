"""Format-correct fake credentials.

Every value here is random and non-functional. Whether a key is "valid" is a
sim flag (valid / invalid / unknown) stored in the save, never a property of
the string. The mock API maps sim validity onto the real enum documented in
reference/api/internal-secret-incidents.md (`validity`: valid | invalid |
failed_to_check | no_checker | unknown).
"""
import base64
import string

B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
ALNUM = string.ascii_letters + string.digits
HEX = "0123456789abcdef"


def _s(r, alphabet, n):
    return "".join(r.choice(alphabet) for _ in range(n))


def _pem(r, label="PRIVATE KEY", nbytes=900):
    raw = base64.b64encode(bytes(r.getrandbits(8) for _ in range(nbytes))).decode()
    body = "\n".join(raw[i:i + 64] for i in range(0, len(raw), 64))
    return f"-----BEGIN {label}-----\n{body}\n-----END {label}-----"


# kind -> (GitGuardian detector display name, has validity checker, provider, generator)
KINDS = {
    "aws_key": ("AWS Keys", True, "aws",
                lambda r: {"AWS_ACCESS_KEY_ID": "AKIA" + _s(r, B32, 16),
                           "AWS_SECRET_ACCESS_KEY": _s(r, ALNUM + "+/", 40)}),
    "gcp_sa": ("Google Cloud Keys", True, "gcp",
               lambda r: {"private_key_id": _s(r, HEX, 40), "private_key": _pem(r)}),
    "github_pat": ("GitHub Personal Access Token", True, "github",
                   lambda r: {"GITHUB_TOKEN": "ghp_" + _s(r, ALNUM, 36)}),
    "github_fg": ("GitHub Fine-Grained Personal Access Token", True, "github",
                  lambda r: {"GH_TOKEN": "github_pat_" + _s(r, ALNUM, 22) + "_" + _s(r, ALNUM, 59)}),
    "slack_bot": ("Slack Bot Token", True, "slack",
                  lambda r: {"SLACK_BOT_TOKEN": f"xoxb-{_s(r, '0123456789', 12)}-{_s(r, '0123456789', 13)}-{_s(r, ALNUM, 24)}"}),
    "stripe_live": ("Stripe Keys", True, "stripe",
                    lambda r: {"STRIPE_SECRET_KEY": "sk_live_" + _s(r, ALNUM, 99)}),
    "mapbox": ("Mapbox Token", True, "mapbox",
               lambda r: {"MAPBOX_ACCESS_TOKEN": "sk.eyJ1Ijoi" + _s(r, ALNUM, 50) + "." + _s(r, ALNUM + "-_", 22)}),
    "google_api": ("Google API Key", True, "google",
                   lambda r: {"GOOGLE_MAPS_API_KEY": "AIza" + _s(r, ALNUM + "-_", 35)}),
    "openai": ("OpenAI API Key", True, "openai",
               lambda r: {"OPENAI_API_KEY": "sk-proj-" + _s(r, ALNUM + "-_", 156)}),
    "anthropic": ("Anthropic API Key", True, "anthropic",
                  lambda r: {"ANTHROPIC_API_KEY": "sk-ant-api03-" + _s(r, ALNUM + "-_", 93) + "AA"}),
    "postgres_uri": ("PostgreSQL Credentials", False, "onprem-db",
                     lambda r: {"DATABASE_URL": None}),  # filled with host by caller
    "twilio": ("Twilio Keys", True, "twilio",
               lambda r: {"TWILIO_ACCOUNT_SID": "AC" + _s(r, HEX, 32), "TWILIO_AUTH_TOKEN": _s(r, HEX, 32)}),
    "sendgrid": ("SendGrid Key", True, "sendgrid",
                 lambda r: {"SENDGRID_API_KEY": "SG." + _s(r, ALNUM + "-_", 22) + "." + _s(r, ALNUM + "-_", 43)}),
    "datadog": ("Datadog API Key", True, "datadog",
                lambda r: {"DD_API_KEY": _s(r, HEX, 32)}),
    "vault": ("HashiCorp Vault Token", False, "vault",
              lambda r: {"VAULT_TOKEN": "hvs." + _s(r, ALNUM + "-_", 91)}),
    "rackspace": ("Generic High Entropy Secret", False, "rackspace",
                  lambda r: {"RAX_API_KEY": _s(r, HEX, 32)}),
    "plaid": ("Plaid Keys", True, "plaid",
              lambda r: {"PLAID_CLIENT_ID": _s(r, HEX, 24), "PLAID_SECRET": _s(r, HEX, 30)}),
    "ssh_key": ("OpenSSH Private Key", False, "onprem",
                lambda r: {"id_rsa": _pem(r, "OPENSSH PRIVATE KEY", 1200)}),
    "npm": ("npm Token", True, "npm",
            lambda r: {"NPM_TOKEN": "npm_" + _s(r, ALNUM, 36)}),
}


def make_secret(r, kind, host=None):
    detector, checker, provider, gen = KINDS[kind]
    vals = gen(r)
    if kind == "postgres_uri":
        user = r.choice(["app", "etl", "reporting", "svc_loan", "geo_ro", "postgres"])
        vals["DATABASE_URL"] = f"postgresql://{user}:{_s(r, ALNUM, 20)}@{host or 'db01.corp.internal'}:5432/{user}db"
    return {"kind": kind, "detector": detector, "has_checker": checker, "provider": provider, "values": vals}


def roll_validity(r, weights=(0.35, 0.45, 0.20)):
    """Three sim states, per the range spec."""
    x = r.random()
    if x < weights[0]:
        return "valid"
    if x < weights[0] + weights[1]:
        return "invalid"
    return "unknown"


def api_validity(secret):
    """Map sim state onto the real API enum."""
    v = secret["validity"]
    if secret.get("status") in ("rotated", "revoked") and v == "valid":
        return "invalid"
    if v == "unknown":
        return "failed_to_check" if secret.get("has_checker") else "no_checker"
    return v


def render_env(values):
    return "\n".join(f"{k}={v}" for k, v in values.items() if "\n" not in str(v))

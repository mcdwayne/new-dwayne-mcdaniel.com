"""Render the bridge page (world/console.html) from state.

The page boots from an embedded copy of the bridge documents, then follows the
live copies in the artifact's db store (bridge/state, bridge/flags,
bridge/people) and the `orders` queue. No secret values or hidden validity
truth are embedded.
"""
import json
import os
from common import WORLD_DIR
import bridge

TEMPLATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bridge_template.html")


def render(state, out=None):
    d = bridge.docs(state)
    boot = {"state": d["bridge/state"], "flags": d["bridge/flags"], "people": d["bridge/people"]}
    html = open(TEMPLATE).read().replace("/*__BOOT__*/null", json.dumps(boot, separators=(",", ":")).replace("</", "<\\/"))
    out = out or os.path.join(WORLD_DIR, "console.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w").write(html)
    return out

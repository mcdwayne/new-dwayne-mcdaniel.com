"""Shared helpers: seeded randomness, gibberish naming, paths.

Everything in the range is derived from the save's seed plus the journal, so
`start` can rebuild repos and flags exactly from the markdown save files.
"""
import hashlib
import os
import random
import re

RANGE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_DIR = os.path.join(RANGE_ROOT, "reference")
SAVES_DIR = os.path.join(RANGE_ROOT, "saves")
WORLD_DIR = os.path.join(RANGE_ROOT, "world")  # generated repos + flags (rebuildable)

HEADCOUNTS = [50, 100, 250, 500, 1000, 5000, 10000, 100000]
SIM_EPOCH = "2026-10-30"  # sim day 0 = the day the range was first designed


def rng(seed, *salt):
    """Independent deterministic stream per purpose, so adding a feature in one
    area never reshuffles another area of an existing save."""
    h = hashlib.sha256(("|".join([str(seed)] + [str(s) for s in salt])).encode()).hexdigest()
    return random.Random(int(h[:16], 16))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


ONSETS = ["b", "bl", "br", "d", "dr", "f", "fl", "g", "gr", "k", "kl", "kr", "l", "m", "n",
          "p", "pl", "pr", "qu", "r", "s", "sk", "sl", "sn", "st", "t", "tr", "v", "w", "z", "zh", "x", "y"]
NUCLEI = ["a", "e", "i", "o", "u", "y", "ai", "ea", "oo", "ou", "ie", "ue", "aa", "io"]
CODAS = ["", "", "", "b", "d", "g", "k", "l", "m", "n", "nk", "p", "r", "rk", "s", "sh", "t", "x", "z", "ft", "mb"]


def gibberish(r, syllables=None, cap=True):
    n = syllables or r.choice([2, 2, 2, 3])
    w = "".join(r.choice(ONSETS) + r.choice(NUCLEI) + r.choice(CODAS) for _ in range(n))
    w = re.sub(r"(.)\1\1+", r"\1\1", w)[:12]
    return w.capitalize() if cap else w


FIRST = ["Ada", "Bao", "Carmen", "Dev", "Elif", "Femi", "Gus", "Hana", "Ines", "Jae", "Kofi", "Lena",
         "Mateo", "Nia", "Omar", "Priya", "Quinn", "Rosa", "Sven", "Tomas", "Uma", "Vik", "Wren", "Ximena",
         "Yusuf", "Zoe", "Aarav", "Bea", "Cyrus", "Dana", "Emeka", "Farah", "Goran", "Hiro", "Isla", "Jonah",
         "Kira", "Luis", "Maya", "Nils", "Odette", "Pavel", "Rhea", "Sami", "Tess", "Ugo", "Vera", "Wes",
         "Yara", "Zane", "Amara", "Bruno", "Chen", "Dmitri", "Esme", "Felix", "Gita", "Hugo", "Ivy", "Jun"]
LAST = ["Abara", "Brandt", "Castillo", "Dimitrov", "Eze", "Fontaine", "Gupta", "Haddad", "Ivanova",
        "Jensen", "Kowalski", "Lindqvist", "Moreau", "Nakamura", "Okafor", "Petrov", "Quispe", "Rahman",
        "Silva", "Tanaka", "Ueda", "Varga", "Whitlock", "Xu", "Yilmaz", "Zielinski", "Ahn", "Bianchi",
        "Cohen", "Diallo", "Engstrom", "Ferreira", "Garcia", "Holm", "Iqbal", "Juarez", "Kaur", "Lopez",
        "Mensah", "Novak", "Osei", "Park", "Reyes", "Sato", "Torres", "Ulrich", "Vasquez", "Weiss", "Young"]


def person_name(r):
    return f"{r.choice(FIRST)} {r.choice(LAST)}"

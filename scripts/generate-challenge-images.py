"""Makes one 16:9 work photo per challenge from scripts/challenge-scenes.json into public/challenges/<id>.webp.
Run once with GEMINI_API_KEY set; existing pictures are kept. Synthetic images for the demo only."""
import base64, io, json, os, sys, urllib.request, concurrent.futures as cf
from PIL import Image
repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
key = os.environ["GEMINI_API_KEY"]
scenes = json.load(open(f"{repo}/scripts/challenge-scenes.json"))
out = f"{repo}/public/challenges"; os.makedirs(out, exist_ok=True)
STYLE = ("Realistic editorial photograph, 16:9 landscape, natural light, Nordic Finnish setting in Espoo, "
         "candid, people of varied ages and backgrounds, no text, no readable words, no logos, no watermarks. Scene: ")
def one(item):
    cid, scene = item
    path = f"{out}/{cid}.webp"
    if os.path.exists(path): return cid, "exists"
    body = json.dumps({"contents": [{"parts": [{"text": STYLE + scene}]}], "generationConfig": {"responseModalities": ["IMAGE"]}}).encode()
    for attempt in range(3):
        try:
            req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent", body, {"x-goog-api-key": key, "content-type": "application/json"})
            d = json.load(urllib.request.urlopen(req, timeout=120))
            data = next(p["inlineData"]["data"] for p in d["candidates"][0]["content"]["parts"] if "inlineData" in p)
            img = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB")
            w, h = img.size; th = int(w * 9 / 16)
            if h > th: top = (h - th) // 2; img = img.crop((0, top, w, top + th))
            img.thumbnail((1600, 900)); img.save(path, "WEBP", quality=80)
            return cid, "ok"
        except Exception as e:
            err = str(e)[:120]
    return cid, "FAIL " + err
with cf.ThreadPoolExecutor(4) as ex:
    for cid, status in ex.map(one, scenes.items()): print(cid, status, flush=True)

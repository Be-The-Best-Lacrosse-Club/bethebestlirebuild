import urllib.request
import json
import os
import sys
from datetime import datetime

token = os.environ.get("NETLIFY_AUTH_TOKEN")
site_id = "aa246044-66ca-4f90-9a2b-076a2b165a4b"

def get_netlify(endpoint):
    req = urllib.request.Request(f"https://api.netlify.com/api/v1/{endpoint}")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}", file=sys.stderr)
        return None

# Check 5: Deploys
deploys = get_netlify(f"sites/{site_id}/deploys")
if deploys:
    prod_deploy = next((d for d in deploys if d['context'] == 'production' and d['state'] == 'ready'), None)
    if prod_deploy:
        print(f"PROD_DEPLOY_STATE: {prod_deploy['state']}")
        print(f"PROD_DEPLOY_TIME: {prod_deploy['published_at']}")
    else:
        print("PROD_DEPLOY_STATE: NOT_FOUND")
else:
    print("PROD_DEPLOY_STATE: ERROR")

# Check 6: Forms
forms = get_netlify(f"sites/{site_id}/forms")
if forms:
    for form in forms:
        print(f"FORM: {form['name']} | COUNT: {form['submission_count']} | LAST: {form['last_submission_at']}")
else:
    print("FORMS: ERROR")

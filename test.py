"""
Quick check: does your CJdropshipping API key work for fetching products?

CJdropshipping's API is a two-step flow:
  1. Exchange your email + API key for an access token
  2. Use that token (as header 'CJ-Access-Token') to call the product list endpoint

Fill in EMAIL and API_KEY below, then run:
    python check_cj_api.py
"""

import requests

EMAIL = "kuldeeppraj2002@gmail.com"      # the email tied to your CJdropshipping account
API_KEY = "CJ5598020@api@feeccd0983384376a0434de9c75a7880"         # the API key from CJdropshipping dashboard

BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1"


def get_access_token(email: str, api_key: str) -> str:
    url = f"{BASE_URL}/authentication/getAccessToken"
    resp = requests.post(url, json={"email": email, "password": api_key})
    resp.raise_for_status()
    data = resp.json()

    if not data.get("result"):
        raise RuntimeError(f"Auth failed: {data.get('message')}")

    return data["data"]["accessToken"]


def fetch_products(access_token: str, page_size: int = 5):
    url = f"{BASE_URL}/product/list"
    headers = {"CJ-Access-Token": access_token}
    params = {"pageNum": 1, "pageSize": page_size}

    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    print("Requesting access token...")
    try:
        token = get_access_token(EMAIL, API_KEY)
        print("✅ Got access token.")
    except Exception as e:
        print(f"❌ Failed to get access token: {e}")
        raise SystemExit(1)

    print("Fetching products...")
    try:
        result = fetch_products(token)
        if result.get("result"):
            products = result.get("data", {}).get("list", [])
            print(f"✅ API key works. Fetched {len(products)} product(s).")
            for p in products:
                print(f"  - {p.get('productNameEn', 'N/A')} ({p.get('pid', 'no id')})")
        else:
            print(f"❌ Product fetch failed: {result.get('message')}")
    except Exception as e:
        print(f"❌ Error fetching products: {e}")
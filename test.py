
import requests

EMAIL = "ankush023dev@gmail.com"  
API_KEY = "CJ5618481@api@589fc2d3c2ee4543b0bfb26b066848ae"
    #the email tied to your CJdropshipping account
# API_KEY = "CJ5598020@api@feeccd0983384376a0434de9c75a7880"         # the API key from CJdropshipping dashboard
BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1"


def get_access_token(email: str, api_key: str) -> str:
    url = f"{BASE_URL}/authentication/getAccessToken"
    resp = requests.post(url, json={"email": email, "password": api_key})
    resp.raise_for_status()
    data = resp.json()

    if not data.get("result"):
        raise RuntimeError(f"Auth failed: {data.get('message')}")

    return data["data"]["accessToken"]


def fetch_products(token: str, page: int = 1, limit: int = 5):
    url = f"{BASE_URL}/product/list?pageNum={page}&pageSize={limit}"
    headers = {"CJ-Access-Token": token}
    
    # Retry loop to handle 429 Too Many Requests
    max_retries = 3
    for attempt in range(max_retries):
        resp = requests.get(url, headers=headers)
        if resp.status_code == 429:
            print(f"⚠️ Rate limited! Waiting 2 seconds before retry {attempt + 1}/{max_retries}...")
            time.sleep(2)
            continue
        
        resp.raise_for_status()
        return resp.json()
    
    raise Exception("Max retries exceeded for 429 Too Many Requests")


if __name__ == "__main__":
    print("Requesting access token...")
    try:
        token = get_access_token(EMAIL, API_KEY)
        print("Got access token.")
    except Exception as e:
        print(f"Failed to get access token: {e}")
        raise SystemExit(1)

    print("Fetching products...")
    try:
        result = fetch_products(token)
        if result.get("result"):
            products = result.get("data", {}).get("list", [])
            print(f"API key works. Fetched {len(products)} product(s).")
            for p in products:
                print(f"  - {p.get('productNameEn', 'N/A')} ({p.get('pid', 'no id')})")
        else:
            print(f"Product fetch failed: {result.get('message')}")
    except Exception as e:
        print(f"Error fetching products: {e}")
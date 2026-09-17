import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("public/receipts", exist_ok=True)
os.makedirs("public/uploads/receipts", exist_ok=True)

def create_thermal_receipt(filename, title, lines, total, gstin, tint=(248, 248, 245)):
    width = 440
    height = 680
    img = Image.new("RGB", (width, height), color=tint)
    draw = ImageDraw.Draw(img)

    # Outer thermal paper edge
    draw.rectangle([10, 10, width - 10, height - 10], outline=(210, 210, 205), width=2)
    
    # Zigzag cut edge at top and bottom
    for x in range(10, width - 10, 15):
        draw.line([(x, 10), (x + 7, 16), (x + 15, 10)], fill=(200, 200, 195), width=1)
        draw.line([(x, height - 10), (x + 7, height - 16), (x + 15, height - 10)], fill=(200, 200, 195), width=1)

    # Header
    y = 35
    draw.text((width // 2, y), title, fill=(20, 20, 20), anchor="mm")
    y += 25
    draw.text((width // 2, y), "TAX INVOICE / RETAIL VOUCHER", fill=(60, 60, 60), anchor="mm")
    y += 20
    draw.line([(25, y), (width - 25, y)], fill=(150, 150, 150), width=1)
    y += 15

    # Lines
    for label, val in lines:
        draw.text((30, y), label, fill=(50, 50, 50))
        draw.text((width - 30, y), str(val), fill=(20, 20, 20), anchor="ra")
        y += 24

    y += 10
    draw.line([(25, y), (width - 25, y)], fill=(120, 120, 120), width=1)
    y += 15

    # Total
    draw.text((30, y), "TOTAL AMOUNT", fill=(10, 10, 10))
    draw.text((width - 30, y), f"INR {total}", fill=(10, 10, 10), anchor="ra")
    y += 35

    # GSTIN & Footer
    draw.line([(25, y), (width - 25, y)], fill=(180, 180, 180), width=1)
    y += 15
    draw.text((width // 2, y), f"GSTIN: {gstin}", fill=(70, 70, 70), anchor="mm")
    y += 20
    draw.text((width // 2, y), "MODE: FLEET CARD / UPI APPROVED", fill=(80, 80, 80), anchor="mm")
    y += 25
    draw.text((width // 2, y), "*** THANK YOU FOR CHOOSING US ***", fill=(100, 100, 100), anchor="mm")

    # Barcode representation
    y += 30
    for bx in range(60, width - 60, 6):
        bw = 2 if (bx % 12 == 0 or bx % 18 == 0) else 4
        draw.rectangle([bx, y, bx + bw, y + 35], fill=(30, 30, 30))

    img.save(filename, "JPEG", quality=92)
    print(f"Generated: {filename}")

# 1. Clean Indian Oil Bill
create_thermal_receipt(
    "public/receipts/demo_indian_oil.jpg",
    "INDIAN OIL CORP LTD",
    [
        ("Station:", "Highway Auto Care #441"),
        ("Pump / Nozzle:", "Bay 04 - Diesel"),
        ("Rate / Litre:", "Rs 94.80 / L"),
        ("Quantity:", "40.61 L"),
        ("Date & Time:", "17-Sep-2026 10:14 AM"),
        ("Vehicle No:", "KA-05-MH-8812"),
    ],
    "3,850.00",
    "29AAACI1681G1ZS"
)

# 2. Duplicate Indian Oil Bill (Slightly warm re-photographed tint)
create_thermal_receipt(
    "public/receipts/demo_indian_oil_dup.jpg",
    "INDIAN OIL CORP LTD",
    [
        ("Station:", "Highway Auto Care #441"),
        ("Pump / Nozzle:", "Bay 04 - Diesel"),
        ("Rate / Litre:", "Rs 94.80 / L"),
        ("Quantity:", "40.61 L"),
        ("Date & Time:", "17-Sep-2026 10:14 AM"),
        ("Vehicle No:", "KA-05-MH-8812"),
    ],
    "3,850.00",
    "29AAACI1681G1ZS",
    tint=(245, 240, 230)
)

# 3. Barbeque Nation Dining
create_thermal_receipt(
    "public/receipts/demo_restaurant.jpg",
    "BARBEQUE NATION HOSPITALITY",
    [
        ("Outlet:", "Indiranagar, Bengaluru"),
        ("Bill / Table:", "BN-8891 / T-12"),
        ("Covers:", "2 Adults Non-Veg"),
        ("Food Total:", "Rs 2,130.43"),
        ("CGST (2.5%):", "Rs 53.26"),
        ("SGST (2.5%):", "Rs 53.26"),
        ("Service Charge:", "Rs 213.05"),
        ("Date & Time:", "14-Sep-2026 08:35 PM"),
    ],
    "2,450.00",
    "29AABCB3982Q1ZQ"
)

# Also copy clean into demo_clean_1850.jpg
create_thermal_receipt(
    "public/receipts/demo_clean_1850.jpg",
    "INDIAN OIL CORP LTD",
    [
        ("Station:", "Bannerghatta Service"),
        ("Fuel Type:", "Diesel Normal"),
        ("Rate / Ltr:", "Rs 94.80"),
        ("Volume:", "19.51 Litres"),
        ("Date & Time:", "16-Sep-2026 11:20 AM"),
    ],
    "1,850.00",
    "29AAACI1681G1ZS"
)

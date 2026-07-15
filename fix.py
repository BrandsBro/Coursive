# fix.py
content = open('app/api/stripe/create-account/route.js').read()
import re
for i, line in enumerate(content.split('\n')):
    if any(x in line.lower() for x in ['timezone', 'locale', 'utc', 'toiso']):
        print(f"Line {i+1}: {line.strip()}")
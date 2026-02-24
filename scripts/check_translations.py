import json
import os
import sys

def get_keys(data, prefix=""):
    """Recursively get all keys from a nested dictionary."""
    keys = set()
    if isinstance(data, dict):
        for k, v in data.items():
            full_key = f"{prefix}.{k}" if prefix else k
            keys.add(full_key)
            keys.update(get_keys(v, full_key))
    return keys

def check_translations(directory):
    files = [f for f in os.listdir(directory) if f.endswith(".json")]
    if not files:
        print("No translation files found.")
        return

    print(f"Checking {len(files)} files: {', '.join(files)}")
    print("-" * 50)

    # Load all keys from all files
    all_file_keys = {}
    master_keys = set()
    
    for filename in files:
        path = os.path.join(directory, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                keys = get_keys(data)
                all_file_keys[filename] = keys
                master_keys.update(keys)
        except Exception as e:
            print(f"Error loading {filename}: {e}")

    # Compare each file against master_keys
    has_errors = False
    for filename, keys in all_file_keys.items():
        missing = master_keys - keys
        if missing:
            has_errors = True
            print(f"\n❌ {filename} is missing {len(missing)} keys:")
            # Sort for readability
            for key in sorted(list(missing)):
                print(f"  - {key}")
        else:
            print(f"\n✅ {filename} is complete.")

    if not has_errors:
        print("\n✨ All translation files are consistent!")
    else:
        sys.exit(1)

if __name__ == "__main__":
    # Path to messages directory relative to project root
    messages_dir = os.path.join(os.getcwd(), "messages")
    if not os.path.exists(messages_dir):
        # Try parent directory if running from scripts/
        messages_dir = os.path.join(os.path.dirname(os.getcwd()), "messages")
    
    check_translations(messages_dir)

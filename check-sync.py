#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json
import ssl
import sys

WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwn1zDZVMlg1ayNKtfIo9aSdv4-VH1O1LEDEY5PGzbWVwBBZmoyJ0to46-QLNnPxyWxNg/exec'

def fetch_url(url):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        data = response.read().decode('utf-8')
        try:
            return json.loads(data)
        except:
            return data

def main():
    # Check if restore argument is passed
    run_restore = len(sys.argv) > 1 and sys.argv[1] == '--restore'

    print('\033[96m\n======================================================')
    print('   TRIQUETRA 2026 - TERMINAL SYNC MONITOR & FLUSHER')
    print('======================================================\033[0m')
    
    if run_restore:
        print('Connecting to restore missing registrations from backup logs...\n')
        try:
            res = fetch_url(f"{WEB_APP_URL}?action=restore_from_backup")
            if res and isinstance(res, dict) and res.get('status') == 'success':
                print('\033[92m✓ Success: ' + res.get('message') + '\033[0m')
                print(f"👉 Restored Rows Count: \033[93m{res.get('restoredCount')}\033[0m")
            else:
                msg = res.get('message') if isinstance(res, dict) else 'Unknown error'
                print('\033[91m✖ Restore Failed: ' + msg + '\033[0m')
        except Exception as e:
            print('\033[91mAn unexpected error occurred during restore:\033[0m')
            print(e)
        print('\033[96m======================================================\n\033[0m')
        return

    print('Connecting to Google Apps Script sync engine...\n')
    try:
        # 1. Fetch current queue status
        status = fetch_url(f"{WEB_APP_URL}?action=get_queue_status")
        
        if not status or not isinstance(status, dict) or status.get('status') != 'success':
            print('\033[91m✖ Connection Error: Could not retrieve queue status.\033[0m')
            print(status)
            return

        print('\033[92m✓ Connected Successfully.\033[0m')
        print('------------------------------------------------------')
        print(f"📂 Registrations in Sheet : \033[93m{status.get('sheetCount')}\033[0m")
        print(f"⏳ Buffered in Queue      : \033[95m{status.get('pendingCount')}\033[0m")
        print(f"📊 Total Registrations    : \033[94m{status.get('totalCount')}\033[0m")
        print('------------------------------------------------------')

        # 2. If queue has pending items, trigger flush automatically
        pending = status.get('pendingCount', 0)
        if pending > 0:
            print('\033[93m' + f"⚠️ Found {pending} pending registrations in the queue buffer." + '\033[0m')
            print('Triggering manual force flush to Google Sheet...\n')
            
            flush_result = fetch_url(f"{WEB_APP_URL}?action=flush_queue")
            
            if flush_result and isinstance(flush_result, dict) and flush_result.get('status') == 'success':
                print('\033[92m' + f"✓ Success: {flush_result.get('message')}" + '\033[0m')
                print(f"👉 Flushed Count: {flush_result.get('flushedCount')}")
                print(f"👉 Remaining in Queue: {flush_result.get('remainingQueue')}")
            else:
                msg = flush_result.get('message') if isinstance(flush_result, dict) else 'Unknown error'
                print('\033[91m' + f"✖ Flush Failed: {msg}" + '\033[0m')
        else:
            print('\033[92m✓ Sheet is fully synced. No pending registration queue entries.\033[0m')
            
        print('\n\033[90m💡 TIP: If rows were accidentally deleted, run:\033[0m')
        print('\033[93m   python3 check-sync.py --restore\033[0m')
        print('\033[96m======================================================\n\033[0m')

    except Exception as e:
        print('\033[91mAn unexpected error occurred:\033[0m')
        print(e)

if __name__ == '__main__':
    main()

import socket
import threading
import sys

SERVER_IP = "127.0.0.1"
PORT = 5000


def receive_messages(client):
    while True:
        try:
            message = client.recv(2048).decode("utf-8", errors="ignore")
            if not message:
                print("\n[!] Connection closed by server.")
                break
            print(f"\n{message}\nYou: ", end="", flush=True)
        except Exception:
            break


def start_client():
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        client.connect((SERVER_IP, PORT))
    except (ConnectionRefusedError, socket.error):
        print(f"[-] Could not connect to chat server at {SERVER_IP}:{PORT}.")
        return

    print("[+] Connected to symposium live broadcast server.")

    try:
        username_request = client.recv(1024).decode("utf-8", errors="ignore")
        print(username_request, end="", flush=True)

        username = input().strip()
        client.sendall((username or "Participant").encode("utf-8"))

        receive_thread = threading.Thread(
            target=receive_messages,
            args=(client,)
        )
        receive_thread.daemon = True
        receive_thread.start()

        print("Chat active. Type your message or '/quit' to exit.\n")

        while True:
            try:
                message = input("You: ").strip()
                if not message:
                    continue

                client.sendall(message.encode("utf-8"))
                if message.lower() == "/quit":
                    break
            except (EOFError, KeyboardInterrupt):
                break

    except Exception as e:
        print(f"\n[!] Session ended: {e}")
    finally:
        try:
            client.close()
        except Exception:
            pass
        print("Disconnected.")


if __name__ == "__main__":
    start_client()
import socket
import threading

HOST = "0.0.0.0"
PORT = 5000
MAX_MSG_LEN = 2048
MAX_USERNAME_LEN = 30

clients = {}
lock = threading.Lock()


def broadcast(message, sender=None):
    """Broadcast a message to all connected clients safely without blocking the global lock."""
    with lock:
        recipients = [c for c in clients.keys() if c != sender]

    encoded = message.encode("utf-8")
    dead_clients = []

    for client in recipients:
        try:
            client.sendall(encoded)
        except Exception:
            dead_clients.append(client)

    if dead_clients:
        with lock:
            for client in dead_clients:
                if client in clients:
                    try:
                        client.close()
                    except Exception:
                        pass
                    clients.pop(client, None)


def handle_client(client, address):
    username = f"{address[0]}:{address[1]}"
    try:
        client.settimeout(60.0)  # Initial handshake timeout
        client.sendall("Enter your username: ".encode("utf-8"))
        raw_user = client.recv(1024).decode("utf-8", errors="ignore").strip()

        if raw_user:
            # Sanitize and truncate username
            username = "".join(ch for ch in raw_user if ch.isprintable())[:MAX_USERNAME_LEN].strip()
            if not username:
                username = f"{address[0]}:{address[1]}"

        client.settimeout(None)  # Reset to non-blocking timeout for chat loop

        with lock:
            clients[client] = username

        print(f"[+] {username} connected from {address}")
        broadcast(f"🔵 {username} joined the chat.", client)

        while True:
            data = client.recv(MAX_MSG_LEN)

            if not data:
                break

            message = data.decode("utf-8", errors="ignore").strip()
            if not message:
                continue

            if message.lower() == "/quit":
                break

            # Sanitize message
            clean_message = "".join(ch for ch in message if ch.isprintable())
            full_message = f"{username}: {clean_message}"
            print(full_message)

            broadcast(full_message, client)

    except Exception as e:
        print(f"[!] Connection notice for {address}: {e}")

    finally:
        with lock:
            clients.pop(client, None)

        try:
            client.close()
        except Exception:
            pass

        print(f"[-] {username} disconnected")
        broadcast(f"🔴 {username} left the chat.")


def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    try:
        server.bind((HOST, PORT))
        server.listen(50)
        print(f" Chat server started on {HOST}:{PORT}")
        print("Waiting for incoming client connections...")

        while True:
            client, address = server.accept()
            thread = threading.Thread(
                target=handle_client,
                args=(client, address)
            )
            thread.daemon = True
            thread.start()

    except KeyboardInterrupt:
        print("\nServer shutting down gracefully...")
    finally:
        server.close()


if __name__ == "__main__":
    start_server()
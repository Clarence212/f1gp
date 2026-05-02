<?php
error_reporting(0);
header('Content-Type: application/json');

$file = 'chat.json';
$max_messages = 50;

// Handle POST request (New Message)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $username = isset($_POST['username']) ? trim($_POST['username']) : 'Anonymous';

    if (!empty($message)) {
        // Read existing messages
        $messages = [];

        if (!file_exists($file)) {
            file_put_contents($file, json_encode([]));
        }

        if (file_exists($file)) {
            $json = file_get_contents($file);
            if ($json) {
                $messages = json_decode($json, true);
                if (!is_array($messages))
                    $messages = [];
            }
        }


        // Add new message
        $messages[] = [
            'username' => substr(htmlspecialchars($username), 0, 15), // Prevent XSS, limit length
            'message' => substr(htmlspecialchars($message), 0, 100), // Prevent XSS, limit length
            'timestamp' => time()
        ];

        // Keep only last 50 messages to prevent file getting too huge
        if (count($messages) > $max_messages) {
            $messages = array_slice($messages, -$max_messages);
        }

        // Save
        file_put_contents($file, json_encode(array_values($messages)), LOCK_EX);
        echo json_encode(['status' => 'success']);
    }
    else {
        echo json_encode(['status' => 'error', 'message' => 'Empty fields']);
    }
}
else {
    // GET request - Return messages
    // Read existing messages or return empty array
    if (file_exists($file)) {
        echo file_get_contents($file);
    }
    else {
        echo json_encode([]);
    }
}
?>

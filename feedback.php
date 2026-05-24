<?php
error_reporting(0);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $feedback = isset($_POST['feedback']) ? trim($_POST['feedback']) : '';
    
    if (!empty($feedback)) {
        $file = 'feedback.txt';
        // Format: [YYYY-MM-DD HH:MM:SS] Feedback text
        $entry = "[" . date('Y-m-d H:i:s') . "] " . htmlspecialchars($feedback) . PHP_EOL;
        
        // Append to feedback.txt
        file_put_contents($file, $entry, FILE_APPEND | LOCK_EX);
        
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Empty feedback']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
}
?>

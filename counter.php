<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$file = 'viewers.json';
$timeout = 10; // User is "offline" if no heartbeat for 10 seconds

// 1. Get current time
$now = time();

// 2. Read existing data
$data = [];
if (file_exists($file)) {
    $json = file_get_contents($file);
    if ($json) {
        $data = json_decode($json, true);
    }
}
if (!is_array($data)) {
    $data = [];
}

// 3. Identify User
// We expect a unique ID from the client to handle proxies/same-IP users correctly
$id = isset($_POST['id']) ? $_POST['id'] : $_SERVER['REMOTE_ADDR'];

// 4. Update current user's timestamp
$data[$id] = $now;

// 5. Prune expired users (clean up the list)
$count = 0;
$newData = [];
foreach ($data as $userId => $timestamp) {
    if ($now - $timestamp <= $timeout) {
        $newData[$userId] = $timestamp;
    }
}

// 6. Save back to file
// Use exclusive lock to prevent race conditions during high traffic
@file_put_contents($file, json_encode($newData), LOCK_EX);

// 7. Return the count
echo json_encode(['count' => count($newData)]);
?>

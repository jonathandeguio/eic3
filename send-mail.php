<?php
header('Content-Type: application/json; charset=utf-8');

// ── Logging ───────────────────────────────────────────────────────────────────
function write_log($status, $data, $detail = '') {
    $dir  = __DIR__ . '/logmails';
    $file = $dir . '/' . date('Y-m-d') . '.log';
    $line  = '[' . date('Y-m-d H:i:s') . '] STATUS=' . $status . ' | ';
    $line .= 'nom='     . ($data['name']    ?? '-') . ' | ';
    $line .= 'societe=' . ($data['company'] ?? '-') . ' | ';
    $line .= 'email='   . ($data['email']   ?? '-') . ' | ';
    $line .= 'pilier='  . ($data['pilier']  ?? '-') . ' | ';
    $line .= 'message=' . str_replace(["\r","\n"], ' ', $data['message'] ?? '-');
    if ($detail) $line .= ' | detail=' . $detail;
    $line .= "\n";
    file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    write_log('ERROR', [], 'Method not allowed');
    echo json_encode(['ok' => false]);
    exit;
}

function clean($v) { return htmlspecialchars(strip_tags(trim($v ?? '')), ENT_QUOTES, 'UTF-8'); }

$data = [
    'name'    => clean($_POST['name']    ?? ''),
    'company' => clean($_POST['company'] ?? ''),
    'email'   => clean($_POST['email']   ?? ''),
    'pilier'  => clean($_POST['pilier']  ?? ''),
    'message' => clean($_POST['message'] ?? ''),
];

if (!$data['name'] || !$data['company'] || !$data['email'] || !$data['pilier'] || !$data['message']) {
    http_response_code(400);
    write_log('ERROR', $data, 'Champs manquants');
    echo json_encode(['ok' => false]);
    exit;
}
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    write_log('ERROR', $data, 'Email invalide');
    echo json_encode(['ok' => false]);
    exit;
}

$to      = 'vincent.deguio@eic3.fr';
$subject = '=?UTF-8?B?' . base64_encode('Contact EIC³ — ' . $data['pilier'] . ' — ' . $data['company']) . '?=';
$body    = "Nom     : {$data['name']}\n"
         . "Société : {$data['company']}\n"
         . "Email   : {$data['email']}\n"
         . "Pilier  : {$data['pilier']}\n\n"
         . "Message :\n{$data['message']}\n";

$headers  = "From: EIC3 Contact <contact@eic3.fr>\r\n";
$headers .= "Reply-To: {$data['email']}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$sent = mail($to, $subject, $body, $headers, '-f contact@eic3.fr');

if ($sent) {
    write_log('SUCCESS', $data);
    echo json_encode(['ok' => true]);
} else {
    $err = error_get_last();
    write_log('FAILED', $data, $err['message'] ?? 'mail() returned false');
    http_response_code(500);
    echo json_encode(['ok' => false]);
}

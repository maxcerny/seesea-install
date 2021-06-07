<?php

$data = file_get_contents("https://seesea.cz/api/cc_event/".$_GET['eventId']."/?format=json");
header('Content-type:application/json;charset=utf-8');
echo json_encode(json_decode($data));
<?php

$data = file_get_contents("https://seesea.cz/api/cc_event/".$_GET['eventId']."/data/live");
header('Content-type:application/json;charset=utf-8');
echo $data;
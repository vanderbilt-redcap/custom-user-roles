<?php
//$module->deleteAll();
$module->saveData();

// $pid = $module->getSystemSetting("master-pid");
// $records = \Records::getData($pid);
// ob_start();
// var_dump($records);
// $txt = ob_get_contents();
// ob_end_clean();
// fwrite($module->log, $txt."\n\n");

// $pid = $module->getSystemSetting("master-pid");
// $project = new \Project($pid);
// $eid = $project->firstEventId;
// $data = REDCap::getData(['project_id' => (string) $pid, 'records' => '1', 'fields' => 'tab_access']);
// fwrite($module->log, "\n" . count($data[1][$eid]['tab_access']) . "\n\n");

// regex test
// $pid = $module->getSystemSetting("master-pid");
// $project = new \Project($pid);
// // 0, Dashboard Item 1 \n 1, Dashboard Item 2 \n 2, Dashboard Item 3 \n 3, Dashboard Item 4 \n 4, Dashboard Item 5 \n 5, Dashboard Item 6 \n 6, Dashboard Item 7 \n 7, Dashboard Item 8 \n 8, Dashboard Item 9 \n 9, Dashboard Item 10 \n 10, Dashboard Item 11 \n 11, Dashboard Item 12
// // preg_match_all("/(?:\d*), (?:[\w ]*)(?:\\n|$)/", $project->metadata['tab_access']['element_enum'], $matches);
// fwrite($module->log, $project->metadata['tab_access']['element_enum'] . "\n");
// // preg_match_all("/\w+/", $project->metadata['tab_access']['element_enum'], $matches);
// // preg_match_all('/(foo)(bar)(baz)/', 'foobarbaz', $matches, PREG_OFFSET_CAPTURE);
// // preg_match_all("/\\\n/", $project->metadata['tab_access']['element_enum'], $matches);
// // fwrite($module->log, "\nmatches: " . print_r($matches, true) . "\n");
// preg_match_all("/\d*, ([\w ]*)(?:(?:\\\\n)|(?:$))/", $project->metadata['tab_access']['element_enum'], $matches);
// fwrite($module->log, "\nmatches: " . print_r($matches, true) . "\n");
// // preg_match_all("/[\\n]/", $project->metadata['tab_access']['element_enum'], $matches);
// // fwrite($module->log, "\nmatches: " . print_r($matches, true) . "\n");
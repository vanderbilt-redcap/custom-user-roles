<?php
namespace Vanderbilt\DataCore\UserRoles;

class UserRoles extends \ExternalModules\AbstractExternalModule {
    public function __construct() {
		parent::__construct();
		// create log that is in redcapversioned/ExternalModules
		$this->log = fopen("log.txt", "w");
		fwrite($this->log, "starting log...\n");
		
		$this->dev = true;
	}
	
	public function __destruct() {
		fwrite($this->log, "Closing log");
		fclose($this->log);
	}
	
	function getChoicesFromMetaData($choicesString) {
		if ($choicesString == "") return "";
		// 1) split by \n or "|" depending on which is used
		if(strpos($choicesString,'\n') !== false)
			$choicesArray1 = explode('\n', $choicesString);
		else
			$choicesArray1 = explode('|', $choicesString);

		// 2) split by ","
		$rawToLabel = array();
		foreach ($choicesArray1 as $keyCommaValue) {
			$separteKeyFromValue = explode(",", $keyCommaValue);
			$key = trim($separteKeyFromValue[0]);
			$value = trim($separteKeyFromValue[1]);
			$rawToLabel[$key] = $value;
		}
		return $rawToLabel;
	}
	
	public function getData() {
		$pid = $this->getSystemSetting("master-pid");
		$configProject = new \Project($pid);
		
		// build json to return
		$data = array(
			"dashboards" => [],
			"reports" => [],
			"roles" => [],
			"dags" => [],
			"projects" => [],
			"customRoles" => [],
		);
		
		// add dashboards
		$choices = $this->getChoicesFromMetaData($configProject->metadata['tab_access']['element_enum']);
		foreach ($choices as $k => $v){
			$data["dashboards"][$k] = $v;
		}
		
		// add reports
		$choices = $this->getChoicesFromMetaData($configProject->metadata['tab_access_2']['element_enum']);
		foreach ($choices as $k => $v){
			$data["reports"][$k] = $v;
		}
		
		// get list of projects user has access to
		//$sql = file_get_contents($this->getUrl("sql" . DIRECTORY_SEPARATOR . "getProjects.sql"));
		// DEV // $sql = str_replace("[USERID]", USERID, $sql);
		//$sql = str_replace("[USERID]", "carl", $sql);
		//$query = db_query($sql);
		$pidList = "";
		/*while ($row = db_fetch_array($query)) {
			$pidList = $pidList . $row['project_id'] . ", ";
			$data["projects"][$row['project_id']] = array(
				"name" => $row['app_title'],
				"roles" => [],
				"dags" => []
			);
		}
		$pidList = substr($pidList, -2) == ", " ? substr($pidList, 0, -2) : $pidList;*/
		// echo "pidList: $pidList\n\n";
        $pidList = $this->getProjects(USERID);

		// add roles
        foreach ($pidList as $projectID => $projectName) {
            $data["projects"][$projectID] = array(
                "name" => $projectName,
                "roles" => [],
                "dags" => []
            );
        }
		/*$sql = file_get_contents($this->getUrl("sql" . DIRECTORY_SEPARATOR . "getRoles.sql"));
		$sql = str_replace("[PID_LIST]", $pidList, $sql);
		$query = db_query($sql);
		while ($row = db_fetch_array($query)) {
			// put role in roles list
			$data["roles"][$row['role_id']] = $row['role_name'];
			
			// also put role in appropriate project object
			$data["projects"][$row['project_id']]["roles"][] = $row['role_id'];
		}*/
		$roleList = $this->getRoles($pidList);
		foreach ($roleList as $roleID => $roleData) {
		    $data["roles"][$roleID] = $roleData['role_name'];
		    $data["projects"][$roleData['project_id']]['roles'][] = $roleID;
        }
		
		// add dags
		/*$sql = file_get_contents($this->getUrl("sql" . DIRECTORY_SEPARATOR . "getDags.sql"));
		$sql = str_replace("[PID_LIST]", $pidList, $sql);
		$query = db_query($sql);
		while ($row = db_fetch_array($query)) {
			// put role in roles list
			$data["dags"][$row['group_id']] = $row['group_name'];
			
			// also put role in appropriate project object
			$data["projects"][$row['project_id']]["dags"][] = $row['group_id'];
		}*/
        $dagList = $this->getDags($pidList);
		foreach ($dagList as $dagID => $dagData) {
		    $data["dags"][$dagID] = $dagData['group_name'];
		    $data["projects"][$dagData['project_id']]["dags"][] = $dagID;
        }

        // add custom role info (customRoles)
		$records = \Records::getData($pid);

		foreach ($records as $i => $a){
			$record = $a[key($a)];

			$newRole = array(
				"name" => $record["role_name"],
				"projects" => $record["project_role"],
				"dashboards" => array(),
				"reports" => array()
			);

			$newRole["active"] = $record["role_active"]=="1" ? "true" : "false";
			$newRole["external"] = $record["affiliation"]=="2" ? "true" : "false";
			foreach ($record["tab_access"] as $key => $val){
				if ($val==1) $newRole["dashboards"][] = $key;
			}
			foreach ($record["tab_access_2"] as $key => $val){
				if ($val==1) $newRole["reports"][] = $key;
			}
			$data["customRoles"][$record[$configProject->table_pk]] = $newRole;
		}

		return json_encode($data);
		
		// dev test/mock data:
		// return file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . "dev" . DIRECTORY_SEPARATOR . "allData.json");
	}
	
	public function saveData() {
		// build array to send to REDCap::saveData from $_POST
		$pid = $this->getSystemSetting("master-pid");
		$project = new \Project($pid);
		$eid = (int) $project->firstEventId;
		
		// ob_start();
		// var_dump($_POST);
		// $txt = ob_get_contents();
		// ob_end_clean();
		// fwrite($this->log, "\nPOST:\n$txt\n\n");
		
		// ob_start();
		// var_dump($_GET);
		// $txt = ob_get_contents();
		// ob_end_clean();
		// fwrite($this->log, "\nGET:\n$txt\n\n");
		
		// exit;
		
		// count how many dashboard items and report items there are
		// $sampleDashboardsField = \REDCap::getData(['project_id' => (string) $pid, 'records' => '1', 'fields' => 'tab_access']);
		// $sampleReportsField = \REDCap::getData(['project_id' => (string) $pid, 'records' => '1', 'fields' => 'tab_access_2']);
		preg_match_all("/\d*, ([\w ]*)(?:(?:\\\\n)|(?:$))/", $project->metadata['tab_access']['element_enum'], $matches);
		$dashboardsCount = count($matches[1]);
		preg_match_all("/\d*, ([\w ]*)(?:(?:\\\\n)|(?:$))/", $project->metadata['tab_access_2']['element_enum'], $matches);
		$reportsCount = count($matches[1]);
		
		// // the following is useful to use as test/mock data
		// $data = [];
		// $data[4] = [];
		// $data[4][40] = [];
		// $data[4][40]['record_id'] = "4";
		// $data[4][40]['role_name'] = "test";
		// $data[4][40]['role_active'] = true;
		// $data[4][40]['role_external'] = false;
		// $data[4][40]["user_roles_complete"] = "2";
		// $data[4][40]['project_access'] = '{"1":{"role":"2","dag":null},"3":{"role":null,"dag":null},"5":{"role":null,"dag":null}}';
		// $data[4][40]['tab_access'] = [];
		// $data[4][40]['tab_access'][0] = "1";
		// $data[4][40]['tab_access'][1] = "1";
		// $data[4][40]['tab_access'][2] = "1";
		// $data[4][40]['tab_access'][3] = "0";
		// $data[4][40]['tab_access'][4] = "0";
		// $data[4][40]['tab_access'][5] = "0";
		// $data[4][40]['tab_access'][6] = "0";
		// $data[4][40]['tab_access'][7] = "0";
		// $data[4][40]['tab_access'][8] = "0";
		// $data[4][40]['tab_access'][9] = "0";
		// $data[4][40]['tab_access'][10] = "0";
		// $data[4][40]['tab_access'][11] = "0";
		// $data[4][40]['tab_access_2'] = [];
		// $data[4][40]['tab_access_2'][0] = "1";
		// $data[4][40]['tab_access_2'][1] = "1";
		// $data[4][40]['tab_access_2'][2] = "1";
		// $data[4][40]['tab_access_2'][3] = "0";
		// $data[4][40]['tab_access_2'][4] = "0";
		// $data[4][40]['tab_access_2'][5] = "0";
		// $data[4][40]['tab_access_2'][6] = "0";
		
		$data = array();
		$rid = 0;
        $recordsObject = new \Records;
        echo "<pre>";
        print_r($_POST);
        echo "</pre>";
        echo "\r\n";

        $choices = $this->getChoicesFromMetaData($project->metadata['tab_access']['element_enum']);
        foreach ($choices as $k => $v){
            $data["dashboards"][$k] = $v;
        }

        // add reports
        $choices = $this->getChoicesFromMetaData($project->metadata['tab_access_2']['element_enum']);
        foreach ($choices as $k => $v){
            $data["reports"][$k] = $v;
        }

		foreach ($_POST as $record_id => $record){
			//$record_id++;
            $savedata = array();
			$savedata[$record_id][$eid][$project->table_pk] = (string) $record_id;
			$savedata[$record_id][$eid]["role_name"] = preg_replace('/[[:cntrl:]]/', '', $record['name']);
			$savedata[$record_id][$eid]["role_active"] = $record['active']==="true" ? "1" : "0";
			$savedata[$record_id][$eid]["affiliation"] = $record['external']==="true" ? "2" : "1";
			$savedata[$record_id][$eid]["project_role"] = json_encode($record['projects']);
			$savedata[$record_id][$eid]["tab_access"] = [];
			$savedata[$record_id][$eid]["tab_access_2"] = [];
			$savedata[$record_id][$eid]["roles_complete"] = "2";
            foreach ($data['dashboards'] as $key => $value) {
                if (in_array($key, $record['dashboards'])) {
                    $savedata[$record_id][$eid]['tab_access'][$key] = "1";
                }
                else {
                    $savedata[$record_id][$eid]['tab_access'][$key] = "0";
                }
            }
            foreach ($data['reports'] as $key => $value) {
                if (in_array($key, $record['reports'])) {
                    $savedata[$record_id][$eid]['tab_access_2'][$key] = "1";
                }
                else {
                    $savedata[$record_id][$eid]['tab_access_2'][$key] = "0";
                }
            }
			/*foreach ($record['dashboards'] as $value) {
			    $savedata[$record_id][$eid]['tab_access'][] = $value;
            }
            foreach ($record['reports'] as $value) {
                $savedata[$record_id][$eid]['tab_access_2'][] = $value;
            }*/
			/*for ($i = 0; $i < $dashboardsCount; $i++) {
				if (in_array($i+1, $record['dashboards'])) {
					$savedata[$record_id][$eid]["tab_access"][$i] = "1";
				} else {
					$savedata[$record_id][$eid]["tab_access"][$i] = "0";
				}
			}
			
			for ($i = 0; $i < $reportsCount; $i++) {
				if (in_array($i+1, $record['reports'])) {
					$savedata[$record_id][$eid]["tab_access_2"][$i] = "1";
				} else {
					$savedata[$record_id][$eid]["tab_access_2"][$i] = "0";
				}
			}*/

            $results = $recordsObject->saveData($pid, 'array', $savedata);
            if (method_exists($recordsObject,'addRecordToRecordListCache')) {
                $recordsObject->addRecordToRecordListCache($pid, $record_id, $project->firstArmNum);
            }
		}
		
		// ob_start();
		// var_dump($data);
		// $txt = ob_get_contents();
		// ob_end_clean();
		// fwrite($this->log, "data:\n$txt\n\n");
        
		/*$results = $recordsObject->saveData($pid, 'array', $data);
        if (method_exists($recordsObject,'addRecordToRecordListCache')) {
            $recordsObject->addRecordToRecordListCache($pid, $data[$project->table_pk], $project->firstArmNum);
        }*/
		
		// dry run:
		// $results = \REDCap::saveData($pid, 'array', $data, null, null, null, null, null, null, false);
		
		fwrite($this->log, "\nresults: " . print_r($results, true) . "\n\n");
		fwrite($this->log, "END\n");
	}

	function getProjects($userID) {
	    $returnString = array();
	    $sql = "SELECT DISTINCT p.project_id, p.app_title
            FROM redcap_projects p
            WHERE p.project_id IN (SELECT projects.project_id
                FROM redcap_projects projects, redcap_user_rights users
                WHERE users.username = '$userID' and users.project_id = projects.project_id)
            ORDER BY p.project_id";
	    //echo "$sql<br/>";
	    $result = db_query($sql);
	    while ($row = db_fetch_assoc($result)) {
	        $returnString[$row['project_id']] = $row['app_title'];
        }
	    return $returnString;
    }

    function getDags($pidList) {
        $returnString = array();
        $sql = "SELECT DISTINCT dags.group_id, dags.project_id, dags.group_name
            FROM redcap_data_access_groups dags
            WHERE dags.project_id IN (".implode(",",array_keys($pidList)).")
            ORDER BY dags.project_id";
        //echo "$sql<br/>";
        $result = db_query($sql);
        while ($row = db_fetch_assoc($result)) {
            $returnString[$row['group_id']] = array('group_name' => $row['group_name'], 'project_id' => $row['project_id']);
        }
        return $returnString;
    }

    function getRoles($pidList) {
        $returnString = array();
        $sql = "SELECT DISTINCT roles.role_id, roles.project_id, roles.role_name
            FROM redcap_user_roles roles
            WHERE roles.project_id IN (".implode(",",array_keys($pidList)).")
            ORDER BY roles.project_id";
        $result = db_query($sql);
        while ($row = db_fetch_assoc($result)) {
            $returnString[$row['role_id']] = array('role_name' => $row['role_name'], 'project_id' => $row['project_id']);
        }
        return $returnString;
    }
}
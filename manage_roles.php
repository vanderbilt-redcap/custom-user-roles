<?php
//$html = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . "html" . DIRECTORY_SEPARATOR . "base.html");

// replace some contents in html head
//$html = str_replace("JS_PATH_", APP_PATH_JS . DIRECTORY_SEPARATOR, $html);
//$html = str_replace("STYLESHEET", $module->getUrl('css' . DIRECTORY_SEPARATOR . 'stylesheet.css') , $html);
//$html = str_replace("MODULE_JS_FILE", $module->getUrl('js'. DIRECTORY_SEPARATOR .'userRoles.js'), $html);

// insert json data for roles and projects -- client uses it to initialize interface for user
//$html = str_replace("DATA", $module->getData(), $html);

//echo $html;

echo "<html lang='en'>
	<head>
		<!-- Required meta tags -->
		<meta charset='utf-8'>
		<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>
		<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.3.1/css/all.css' integrity='sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU' crossorigin='anonymous'>
		<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' integrity='sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO' crossorigin='anonymous'>
		<link rel='stylesheet' href='".$module->getUrl('css' . DIRECTORY_SEPARATOR . 'stylesheet.css')."'>
		<title>Custom User Roles</title>
	</head>
	<body class='container'>
		<!-- data -->
		<p style='display:none;' id='data'>".$module->getData()."</p>
		
		<!-- roles -->
		<div id='rolesDiv' class='card mt-5'>
			<!-- top header -->
			<div class='row m-3'>
				<div class='col text-center'>
					<h3>Custom User Roles</h3>
				</div>
			</div>
			<div class='card-body'>
				<button class='btn m-2' type='button' onclick='UserRoles.addRole()'>Create</button>
				<button class='btn m-2' type='button' onclick='UserRoles.saveChanges()'>Save Changes</button>
				<button style='display: none' class='btn m-2' type='button' onclick='UserRoles.deleteRole()'>Delete</button>
				<button style='display: none' class='btn m-2' type='button' onclick='UserRoles.renameRole()'>Rename</button>
				<div class='row'>
					<p class='col ml-2'>Select a role to make changes</p>
				</div>
				<div class='col-ml-2' style='margin-left:15px;margin-bottom:10px;'>
				    <select id='role_select' class='select2' onchange='UserRoles.loadUserRole(this)'>
                        <option value=''></option>
                    </select>
                </div>
				<table class='table'>
					<thead>
						<tr>
							<th scope='col'>Name</th>
							<th scope='col'>Active</th>
							<th scope='col'>External</th>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
		</div>
		
		<!-- projects -->
		<div id='projectsDiv' class='card mt-5'>
			<div class='row m-3'>
				<div class='col text-center'>
					<h3>Project Access</h3>
				</div>
			</div>
			<div class='card-body'>
				<button type='button' class='btn m-2' onclick='UserRoles.addProjectRow()'>Add</button>
				<div class='row'>
					<p class='col ml-2'>After selecting a role, add or remove rows to grant access to projects, roles, or data access groups</p>
				</div>
				<table class='table'>
					<thead>
						<tr>
							<th scope='col'>PID</th>
							<th scope='col'>Project Title</th>
							<th scope='col'>Roles</th>
							<th scope='col'>Data Access Groups</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
		</div>
		
		<!-- dashboards -->
		<div id='dashboardsDiv' class='card mt-5'>
			<div class='row m-3'>
				<div class='col text-center'>
					<h3>Dashboard Access</h3>
				</div>
			</div>
			<div class='list'>
			</div>
		</div>
		
		<!-- reports -->
		<div id='reportsDiv' class='card my-5'>
			<div class='row m-3'>
				<div class='col text-center'>
					<h3>Report Access</h3>
				</div>
			</div>
			<div class='list'>
			</div>
		</div>
		
		".$module->framework->loadREDCapJS()."
		<script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js' integrity='sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49' crossorigin='anonymous'></script>
		".$module->framework->loadBootstrap()."
		<script type='text/javascript' src='".$module->getUrl('js'. DIRECTORY_SEPARATOR .'userRoles.js')."'></script>
	</body>
</html>";
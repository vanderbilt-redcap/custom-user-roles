var UserRoles = {}

$(function() {
	// add json data to our global UserRoles object
	// UserRoles.[customRoles, roles, dags, dashboards, reports]
	UserRoles = JSON.parse($("#data").html())
	//console.log(UserRoles)

	//Old 'dropdown' HTML for project rows
        /*`
			<tr>
				<td></td>
				<td>
					<div class="dd-container">
						<button onclick="$(this).siblings('[class*=dd-content').toggle(100)" class="dd-header project-dd btn">(Unassigned)<i style='padding-left: 8px' class='fas fa-caret-down'></i></button>
						<div class="dd-content">
						</div>
					</div>
				</td>
				<td>
					<div class="dd-container">
						<button onclick="$(this).siblings('[class*=dd-content').toggle(100)" class="dd-header role-dd btn">(Unassigned)<i style='padding-left: 8px' class='fas fa-caret-down'></i></button>
						<div class="dd-content">
							<span>(Unassigned)</span>
						</div>
					</div>
				</td>
				<td>
					<div class="dd-container">
						<button onclick="$(this).siblings('[class*=dd-content').toggle(100)" class="dd-header dag-dd btn">(Unassigned)<i style='padding-left: 8px' class='fas fa-caret-down'></i></button>
						<div class="dd-content">
							<span>(Unassigned)</span>
						</div>
					</div>
				</td>
				<td>
					<div class="dd-container">
						<button type='button' class='btn m-2' onclick='UserRoles.removeProjectRow(this)'>Remove</button>
					</div>
				</td>
			</tr>`*/
	UserRoles.templates = {
		projectRow:`
			<tr>
				<td></td>
				<td>
					<div class="dd-container">
						<select style="width:325px;text-overflow:ellipsis;" class="select2 project-dd" onchange="UserRoles.changeProjectRole(this)">
						<option value="">Unassigned</option>						
						</select>
					</div>
				</td>
				<td>
					<div class="dd-container">
						<select style="width:160px;text-overflow:ellipsis;" class="select2 role-dd" onchange="UserRoles.changeProjectRole(this)">					
						</select>
					</div>
				</td>
				<td>
					<div class="dd-container">
						<select style="width:160px;text-overflow:ellipsis;" class="select2 dag-dd" onchange="UserRoles.changeProjectRole(this)">					
						</select>
					</div>
				</td>
				<td>
					<div class="dd-container">
						<button type='button' class='btn m-2' onclick='UserRoles.removeProjectRow(this)'>Remove</button>
					</div>
				</td>
			</tr>`,
		projectList: ""
	}
	
	UserRoles.addRole = function(record_id) {
		if (!record_id) {
			// console.log(UserRoles.customRoles)
			var newRole = {
				name: "New Role",
				projects: {},
				dashboards: [],
				reports: [],
				active: "false",
				external: "false"
			}
			var flag = false
			var index = 0
			while (!flag) {
				if (UserRoles.customRoles[index] == undefined) {
					flag = true
					record_id = index
				}
				index += 1
			}
			UserRoles.customRoles[record_id] = newRole
			// console.log(UserRoles.customRoles)
		}
		
		var role = UserRoles.customRoles[record_id]
        var o = new Option(role.name, record_id);
        $("#role_select").append(o);
	}
	
	UserRoles.deleteRole = function() {
		// removed entry from UserRoles.customRoles
		delete UserRoles.customRoles[String($(".roleButton.selected").attr('record_id'))]

		// remove row from user roles table
		$(".roleButton.selected").closest('tr').remove()
		
		// hide delete and rename buttons
		$("#rolesDiv button:eq(1)").show(100)
		$("#rolesDiv button:eq(2)").hide(100)
		$("#rolesDiv button:eq(3)").hide(100)
		
		// remove project access table rows and untoggle report/dashboard items
		$(".btn").removeClass("selected")
		$("#projectsDiv tbody").html("")
	}
	
	UserRoles.renameRole = function() {
		$(".roleButton.selected").html("<input id='newRoleName' type='text'>")
		$(".roleButton.selected input").focus()
		$(".roleButton.selected input").focusout(function(e) {
			var newName = $(".roleButton.selected input").val()
			$(".roleButton.selected").html(newName)
			UserRoles.customRoles[String($(".roleButton.selected").attr('record_id'))].name = newName
			$("#rolesDiv button:eq(1)").show(100)
		})
	}
	
	UserRoles.saveChanges = function() {
		$("#rolesDiv button:eq(1)").html("Saving...")
		
		// send UserRoles.customRoles data to server so it can save records
		var url = window.location.href.replace("manage_roles", "save_changes")
		var data = UserRoles.customRoles

		var postdata = {};

		jQuery.each(data,function(key,value) {
			postdata[key] = value;
		})

		 /*var data = {
			 "1": {
				 name: "Role A",
				 active: true,
				 external: false,
				 dashboards: ['1', '11'],
				 reports: ['1', '10'],
				 projects: {'1': {'role': '1', 'dag': null}}
			 }
		 }*/

		jQuery.post({
			url: url,
			// method: "POST",
			data: postdata,
			complete: function(response, mode) {
				//console.log("response text: " + response.responseText)
				// console.log("jqxhr mode: " + mode)
				var text = (mode == "success") ? "Success!" : "Error - Try Again"
				$("#rolesDiv button:eq(1)").html(text)
				$("#rolesDiv button:eq(1)").delay(1000).hide(100, function() {
					$("#rolesDiv button:eq(1)").html("Save Changes")
				})
			}
		})
	}
	
	UserRoles.seedRoleDagButtons = function(projectDropdown){
        var pid = $(projectDropdown).val();
        project = UserRoles.projects[String(pid)]

        var roleSelect = $(projectDropdown).closest('tr').find('.role-dd')
        var dagSelect = $(projectDropdown).closest('tr').find('.dag-dd')

		if (project) {
            $(roleSelect).empty().append("<option value=''>UnAssigned</option>")
            $(dagSelect).empty().append("<option value=''>UnAssigned</option>")
			roleContent = ""
			jQuery.each(project.roles, function(index,value) {
				if (String(index) != "" && String(value) != "") {
                    roleContent += "<option value='" + value + "'>" + UserRoles.roles[value] + "</option>"
                }
			})
			$(roleSelect).append(roleContent)

			dagContent = ""
			jQuery.each(project.dags, function(index,value) {
                if (String(index) != "" && String(value) != "") {
                    dagContent += "<option value='" + value + "'>" + UserRoles.dags[value] + "</option>"
                }
			})
			$(dagSelect).append(dagContent)
		} else {
			$(roleSelect).empty().append(emptyOption)
			$(dagSelect).empty().append(emptyOption)
		}
	}
	
	UserRoles.addProjectRow = function(pid, role_id, group_id){
		console.log('Pre return');
		if ($(".roleButton.selected").length == 0) return
		console.log('Post return');
		let projectRow = $(UserRoles.templates.projectRow)
		// seed new row first dropdown with list of projects
		//projectRow.find(".dd-content").first().append(UserRoles.templates.projectList)
        projectRow.find(".project-dd").append(UserRoles.templates.projectList)

		$("#projectsDiv").find("tbody").append(projectRow)

		// if pid/role/dag supplied set those
		$("#projectsDiv .project-dd").each(function() {
			$("#projectsDiv tr:last .project-dd option[value='"+$(this).val()+"']").remove()
		});
		console.log(projectRow);
		console.log(pid);
		if (pid) {
			var projectDropdown = $("#projectsDiv tr:last .project-dd")
			$("#projectsDiv tr:last td:eq(0)").html(pid)
			// set project dropdown text and seed role/dag button options
			projectDropdown.val(String(pid)).change()
			console.log(projectDropdown);
			//UserRoles.seedRoleDagButtons(projectDropdown)
		}

		if (role_id) {
			var roleDropdown = $("#projectsDiv tr:last .role-dd")
			roleDropdown.val(String(role_id)).change()
		}

		if (group_id) {
			var dagDropdown = $("#projectsDiv tr:last .dag-dd")
			dagDropdown.val(String(group_id)).change()
		}
	}
	
	UserRoles.removeProjectRow = function(button){
		// find selected row if exists
		selectedRow = $("#projectsDiv tbody tr.selected")
        button.closest("tr").remove();
		//selectedRow.length > 0 ? selectedRow.first().remove() : $("#projectsDiv tbody tr").last().remove()
		UserRoles.setUserRoles()
	}
	
	UserRoles.setUserRoles = function() {
		// find out which role is selected
		var selectedRole = UserRoles.customRoles[$(".roleButton.selected").attr('record_id')]
		if (!selectedRole) {
			console.log("no selected role")
			return
		}
		// convert project access table contents to json to store in UserRoles
		var projectAccess = {}
		$("#projectsDiv tbody tr").each(function(index, row) {
			var pid = $(row).find('.project-dd').val()
			var role = $(row).find('.role-dd').val()
            var dag = $(row).find('.dag-dd').val()
			
			projectAccess[pid] = {"role": null, "dag": null}
			if (role != "") projectAccess[pid].role = role
			if (dag != "") projectAccess[pid].dag = dag
		})
		
		selectedRole.projects = projectAccess
		// (enable save changes button)
		$("#rolesDiv button:eq(1)").show(100)
	}

	UserRoles.loadUserRole = function(select) {
        $("#rolesDiv table tbody tr").remove();
        $("#projectsDiv tbody").html("")
        $("#dashboardsDiv button").removeClass("selected")
        $("#reportsDiv button").removeClass("selected")
		var record_id = select.value;
		if (String(record_id) != "") {
            var role = UserRoles.customRoles[record_id]
            var falseCheckbox = "<input type=\"checkbox\">"
            var trueCheckbox = "<input type=\"checkbox\" checked>"
            let tableRow = `
				<tr>
					<td><button record_id=\"${record_id}\" type=\"button\" class=\"btn roleButton\">${role.name}</button></td>
					<td>${role.active == "true" ? trueCheckbox : falseCheckbox}</td>
					<td>${role.external == "true" ? trueCheckbox : falseCheckbox}</td>
				</tr>
			`
            $("#rolesDiv table tbody").append(tableRow)

            /// jquerify the DOM object 'o' so we can use the html method
            $("#rolesDiv tbody tr:last td:eq(1) input").addClass('activeCheckbox')
            $("#rolesDiv tbody tr:last td:eq(2) input").addClass('externalCheckbox')

            // enable save changes button
            $("#rolesDiv button:eq(1)").show(100)

            $("#rolesDiv td:nth-child(1) button").trigger('click')
        }
        else {
            // enable save changes button
            $("#rolesDiv button:eq(1)").show(100)
		}
	}

	UserRoles.changeProjectRole = function(select) {
        var pid = $(select).closest('tr').find('.project-dd').val();

        // set pid in column 1 of project access table
        $(select).closest('tr').find('td:eq(0)').html(pid)

        if ($(select).hasClass("project-dd")) {
        	UserRoles.seedRoleDagButtons(select)
        }

        UserRoles.setUserRoles()
	}
	
	// // Project divs section for add/remove buttons
	// build projectList template string
	var sortProjects = [];
	for (var pid in UserRoles.projects) {
		if (UserRoles.projects.hasOwnProperty(pid)) {
			sortProjects[pid] = [pid, UserRoles.projects[pid].name]
		}
	}
	function cmp(a,b) {
		return a[1].localeCompare(b[1])
	}
	sortProjects.sort(cmp);

	for (var index in sortProjects){
		//UserRoles.templates.projectList += "<span>" + UserRoles.projects[pid].name + "</span>\n"
        UserRoles.templates.projectList += "<option value='"+sortProjects[index][0]+"'>" + sortProjects[index][1] + "</option>\n"
	}
	for (var role_name in UserRoles.customRoles){
		var role = UserRoles.customRoles[role_name]
		try {
            role.projects = JSON.parse(role.projects)
        }
        catch (err) {
			role.projects = JSON.parse('{}')
		}
	}
	
	// add roles
	for (var record_id in UserRoles.customRoles) {
		UserRoles.addRole(record_id)
	}
	var dashItems = '';
	var reportItems = '';
	jQuery.each(UserRoles.dashboards, function(key, value) {
		dashItems += "<button dashboardid=\"" + key + "\" class=\"btn m-3\" type=\"button\">" + value + "</button>";
	})
	jQuery.each(UserRoles.reports, function(key, value) {
		reportItems += "<button reportid=\"" + key + "\" class=\"btn m-3\" type=\"button\">" + value + "</button>";
	})
	// add dashboard and report items
	//dashItems = UserRoles.dashboards.map(function(name, index) {return "<button dashboardid=\"" + index + "\" class=\"btn m-3\" type=\"button\">" + name + "</button>"})
	//$("#dashboardsDiv .list").append(dashItems.join(''))
    $("#dashboardsDiv .list").append(dashItems)
	//reportItems = UserRoles.reports.map(function(name, index) {return "<button reportid=\"" + index + "\" class=\"btn m-3\" type=\"button\">" + name + "</button>"})
	//$("#reportsDiv .list").append(reportItems.join(''))
    $("#reportsDiv .list").append(reportItems)
	/////////// click handlers ->
	// when click on role buttons ->

	$("#rolesDiv").on("click", "td:nth-child(1) button", function() {
		// user clicked a role
		$(".roleButton").removeClass("selected")
		$(this).addClass('selected')

		var selectedRole = UserRoles.customRoles[$(".roleButton.selected").attr('record_id')]
		// show delete and rename buttons
		var roleProjects= selectedRole.projects
		$("#rolesDiv button:eq(3)").show(100)
		$("#rolesDiv button:eq(2)").show(100)
		
		// add/remove project access rows as necessary to match existing role access
		$("#projectsDiv tbody").html("")

		if (selectedRole.projects != null) {
            Object.keys(selectedRole.projects).forEach(function (pid, index) {
				if (typeof selectedRole.projects[pid] === "undefined") {
                    selectedRole.projects[pid] = roleProjects[pid]
					UserRoles.customRoles[$(".roleButton.selected").attr('record_id')].projects[pid] = roleProjects[pid]
				}
                var role_id = selectedRole.projects[pid]['role']
                var group_id = selectedRole.projects[pid]['dag']
				console.log(UserRoles.projects);
                if (UserRoles.projects[pid]) {
                	console.log('User role set for '+pid);
                    UserRoles.addProjectRow(pid, role_id, group_id)
                }
                // console.log("pid: " + pid)
            })
        }
		
		// toggle dashboard/report access items to match existing
		$("#dashboardsDiv button").removeClass("selected")
		for (var i in selectedRole.dashboards) {
			$('[dashboardid="'+(selectedRole.dashboards[i])+'"]').addClass('selected')
		}
		$("#reportsDiv button").removeClass("selected")
		for (var i in selectedRole.reports) {
			$('[reportid="'+(selectedRole.reports[i])+'"]').addClass('selected')
		}
	})
	
	// when click on active or external checkboxes ->
	$("#rolesDiv").on('click', ".activeCheckbox", function() {
		var checked = $(this).prop('checked')
		var record_id = $(this).closest('tr').find('td:eq(0) button').attr('record_id')
		var role = UserRoles.customRoles[record_id]
		if (role) {
			role.active = checked
		}
		// enable save changes button
		$("#rolesDiv button:eq(1)").show(100)
	})
	$("#rolesDiv").on('click', ".externalCheckbox", function() {
		var checked = $(this).prop('checked')
		var record_id = $(this).closest('tr').find('td:eq(0) button').attr('record_id')
		var role = UserRoles.customRoles[record_id]
		if (role) {
			role.external = checked
		}
		// enable save changes button
		$("#rolesDiv button:eq(1)").show(100)
	})
	
	// when click on report or dashboard items ->
	toggle = function(button, type) {
		var selectedRole = UserRoles.customRoles[$(".roleButton.selected").attr('record_id')]

		if ($(button).hasClass('selected')) {
			$(button).removeClass('selected')
			var itemIndex = String($(button).attr(type+'id'))

			if (selectedRole) {
				var arrayIndex = selectedRole[type+'s'].indexOf(itemIndex)
				if (arrayIndex >= 0) {
					selectedRole[type+'s'].splice(arrayIndex, 1)
					// (enable save changes)
					$("#rolesDiv button:eq(1)").show(100)
				}
                /*var arrayIndex = selectedRole[type+'s'].itemIndex
                if (arrayIndex >= 0) {
                    selectedRole[type+'s'][itemIndex] = "0"
                    // (enable save changes)
                    $("#rolesDiv button:eq(3)").show(100)
                }*/
			}
		} else {
			$(button).addClass('selected')

			var itemIndex = String($(button).attr(type+'id'))
			if (selectedRole) {
				var arrayIndex = selectedRole[type+'s'].indexOf(itemIndex)
				if (arrayIndex == -1) {
					selectedRole[type+'s'].push(itemIndex)
					//selectedRole[type+'s'][itemIndex] = "1"
					// (enable save changes)
					$("#rolesDiv button:eq(1)").show(100)
				}
                /*var arrayIndex = selectedRole[type+'s'].itemIndex
                if (arrayIndex !=  "1") {
                    selectedRole[type+'s'][itemIndex] = "1"
                    // (enable save changes)
                    $("#rolesDiv button:eq(3)").show(100)
                }*/
			}
		}
	}
	$("#dashboardsDiv").on("click", "button", function() {toggle(this, 'dashboard')})
	$("#reportsDiv").on("click", "button", function() {toggle(this, 'report')})
	$("#projectsDiv").on("click", "tbody tr", function(){
		// untoggle all project table rows except newly selected
		$("#projectsDiv tbody tr").removeClass('selected')
		$(this).addClass('selected')
	})
	
	///// dropdown/project access table items ->
	// handle dropdown content clicking
	$("body").on("click", ".dd-content *", function(){
		// determine project id and title
		var ddButton = $(this).parent().siblings(".dd-header")
		var clicked = $(this).html()
		
		var projectTitle
		if (ddButton.is(".project-dd")) {
			projectTitle = clicked.replace("<i style='padding-left: 8px' class='fas fa-caret-down'></i>", "")
		} else {
			projectTitle = $(this).closest('tr').find('td:eq(1) button').html().replace("<i style='padding-left: 8px' class='fas fa-caret-down'></i>", "")
		}
		projectTitle = projectTitle.replace('<i style="padding-left: 8px" class="fas fa-caret-down"></i>', "")
		
		var pid
		for (var key in UserRoles.projects) {
			if (UserRoles.projects[key].name == projectTitle) {pid = key}
		}
		
		// set pid in column 1 of project access table
		$(this).closest('tr').find('td:eq(0)').html(pid)
		
		var ddType
		if (ddButton.hasClass("project-dd")) ddType = "project"
		if (ddButton.hasClass("role-dd")) ddType = "role"
		if (ddButton.hasClass("dag-dd")) ddType = "dag"
		
		// put clicked text in dropdown button
		ddButton.html(clicked + "<i style='padding-left: 8px' class='fas fa-caret-down'></i>")
		$(this).parent().toggle(100)
		
		// if project dropdown got altered, seed options for role and dag dropdowns
		if (ddButton.is(".project-dd")) {
			var project = UserRoles.projects[String(pid)]
			
			// switching projects so unassign current role/dag
			$(ddButton.closest('tr').find(".dd-header")[1]).html("(Unassigned)<i style='padding-left: 8px' class='fas fa-caret-down'></i>")
			$(ddButton.closest('tr').find(".dd-header")[2]).html("(Unassigned)<i style='padding-left: 8px' class='fas fa-caret-down'></i>")
			
			// seed dd options
			var roleDiv = ddButton.closest('tr').find(".dd-content")[1]
			var dagDiv = ddButton.closest('tr').find(".dd-content")[2]
			if (project) {
				var roleContent = "<span>(Unassigned)</span>"
				for (var i=0; i<project.roles.length; i++) {
					roleContent += "\n<span>" + UserRoles.roles[project.roles[String(i)]] + "</span>"
				}
				$(roleDiv).html(roleContent)
				
				var dagContent = "<span>(Unassigned)</span>"
				for (var i=0; i<project.dags.length; i++) {
					dagContent += "\n<span>" + UserRoles.dags[project.dags[String(i)]] + "</span>"
				}
				$(dagDiv).html(dagContent)
			} else {
				$(roleDiv).html("<span>(Unassigned)</span>")
				$(dagDiv).html("<span>(Unassigned)</span>")
			}
		}
		
		UserRoles.setUserRoles()
	})
	
	// close non-clicked dropdowns
	window.onclick = function(event) {
		divs = $(".dd-content")
		for (i=0; i<divs.length; i++) {
			// console.log($(divs[i]).closest(".dd-container"))
			if (!$(divs[i]).closest(".dd-container").has(event.target).length > 0) {
				$(divs[i]).hide(100)
			}
		}
	}
	$("#rolesDiv button:eq(1)").hide(0)
	//console.log(UserRoles);
	// if press enter, assume the user is trying to rename a role
	$(document).keypress(function(e) {
		if (e.which==13) {
			var newName = $(".roleButton.selected input").val()
			$(".roleButton.selected").html(newName)
			UserRoles.customRoles[String($(".roleButton.selected").attr('record_id'))].name = newName || "New Role"
			$("#rolesDiv button:eq(1)").show(100)
		}
	})
})
//����� ������� � ����������� ����� � ������
$(async function() {await thisUser();});

async function thisUser() {
    fetch("http://localhost:8080/api/viewUser")
        .then(res => res.json())
        .then(data => {
            // ���� � �����
            $('#headerUsername').append(data.username);
            let roles = data.roles.map(role => " " + role.role.substring(5));
            $('#headerRoles').append(roles);

            //���� � �������
            let user = `$(
            <tr><td>${data.id}</td>
                <td>${data.firstName}</td>
                <td>${data.age}</td>
                <td>${roles}</td>)`;
            $('#userPanelBody').append(user);
        })
} //����� ������� � ����������� ����� � ������


//����������� ���� ������ �� ��������� ������
$(async function () {await allUsers();});

const table = $('#tbodyAllUserTable');

async function allUsers() {
    table.empty()
    fetch("http://localhost:8080/api/users")
        .then(res => res.json())
        .then(data => {
            data.forEach(user => {
                let tableWithUsers = `$(
                        <tr><td>${user.id}</td>
                            <td>${user.firstName}</td>
                            <td>${user.age}</td>
                            <td>${user.roles.map(role => " " + role.role.substring(5))}</td>
                            <td><button type="button" class="btn btn-info" data-toggle="modal" id="buttonEdit"
                                data-action="edit" data-id="${user.id}" data-target="#edit">Edit</button>
                            </td>
                            
                            <td><button type="button" class="btn btn-danger" data-toggle="modal" id="buttonDelete"
                                data-action="delete" data-id="${user.id}" data-target="#delete">Delete</button>
                            </td>
                        </tr>)`;
                table.append(tableWithUsers);
            })
        })
} //����������� ���� ������ �� ��������� ������


//���������� ������ �����
$(async function() {await newUser();});

async function newUser() {
    await fetch("http://localhost:8080/api/roles")
        .then(res => res.json())
        .then(roles => {
            roles.forEach(role => {
                let el = document.createElement("option");
                el.text = role.role.substring(5);
                el.value = role.id;
                $('#newUserRoles')[0].appendChild(el);
            })
        })

    const form = document.forms["formNewUser"];

    form.addEventListener('submit', addNewUser)
    function addNewUser(e) {
        e.preventDefault();
        let newUserRoles = [];
        for (let i = 0; i < form.roles.options.length; i++) {
            if (form.roles.options[i].selected) newUserRoles.push({
                id : form.roles.options[i].value,
                name : form.roles.options[i].name
            })
        }

        fetch("http://localhost:8080/api/users", {
            method: 'POST', headers: {'Content-Type': 'application/json'},

            body: JSON.stringify({
                firstName: form.firstName.value,
                password: form.password.value,
                age: form.age.value,
                roles: newUserRoles
            })

        }).then(() => {
            form.reset();
            allUsers();
            $('#allUsersTable').click();
        })
    }
} //���������� ������ �����

//��������� ������ �����
$('#edit').on('show.bs.modal', ev => {
    let button = $(ev.relatedTarget);
    let id = button.data('id');
    showEditModal(id);
})

async function showEditModal(id) {
    $('#rolesEditUser').empty();
    let user = await getUser(id);
    let form = document.forms["formEditUser"];
    form.id.value = user.id;
    form.firstName.value = user.firstName;
    form.password.value = user.password;
    form.age.value = user.age;

    await fetch("http://localhost:8080/api/roles")
        .then(res => res.json())
        .then(roles => {roles.forEach(role => {
            let selectedRole = false;
            for (let i = 0; i < user.roles.length; i++) {
                if (user.roles[i].name === role.name) {
                    selectedRole = true;
                    break;
                }
            }
            let el = document.createElement("option");
            el.text = role.role.substring(5);
            el.value = role.id;
            if (selectedRole) el.selected = true;
            $('#rolesEditUser')[0].appendChild(el);
        })
        })
} // ��������� ������ �����


//��������� ����� �� ��������� ������
$(async function() {editUser();});

function editUser() {
    const editForm = document.forms["formEditUser"];
    editForm.addEventListener("submit", ev => {
        ev.preventDefault();
        let editUserRoles = [];
        for (let i = 0; i < editForm.roles.options.length; i++) {
            if (editForm.roles.options[i].selected) editUserRoles.push({
                id : editForm.roles.options[i].value,
                name : "ROLE_" + editForm.roles.options[i].text
            })
        }

        fetch("http://localhost:8080/api/users/" + editForm.id.value, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},

            body: JSON.stringify({
                id: editForm.id.value,
                firstName: editForm.firstName.value,
                password: editForm.password.value,
                age: editForm.age.value,
                roles: editUserRoles
            })
        }).then(() => {$('#editFormCloseButton').click();
            allUsers();
        })
    })
} //��������� ����� �� ��������� ������


//�������� ������ �����
$('#delete').on('show.bs.modal', ev => {
    let button = $(ev.relatedTarget);
    let id = button.data('id');
    showDeleteModal(id);
})

async function showDeleteModal(id) {
    let user = await getUser(id);
    let form = document.forms["formDeleteUser"];
    form.id.value = user.id;
    form.firstName.value = user.firstName;
    form.password.value = user.password;
    form.age.value = user.age;

    $('#rolesDeleteUser').empty();

    await fetch("http://localhost:8080/api/roles")
        .then(res => res.json())
        .then(roles => {
            roles.forEach(role => {
                let selectedRole = false;
                for (let i = 0; i < user.roles.length; i++) {
                    if (user.roles[i].name === role.role) {
                        selectedRole = true;
                        break;
                    }
                }
                let el = document.createElement("option");
                el.text = role.role.substring(5);
                el.value = role.id;
                if (selectedRole) el.selected = true;
                $('#rolesDeleteUser')[0].appendChild(el);
            })
        });
}

async function getUser(id) {
    let url = "http://localhost:8080/api/users/" + id;
    let response = await fetch(url);
    return await response.json();
} //�������� ������ �����


//�������� ������ �����
$(async function() {deleteUser();});

function deleteUser(){
    const deleteForm = document.forms["formDeleteUser"];
    deleteForm.addEventListener("submit", ev => {
        ev.preventDefault();
        fetch("http://localhost:8080/api/users/" + deleteForm.id.value, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {$('#deleteFormCloseButton').click();
                allUsers();
            })
    })
} //�������� ������ �����







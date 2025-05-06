document.addEventListener('DOMContentLoaded', function() {
  const colors = [
    '#e6194b', '#4363d8', '#911eb4', '#000075', '#800000', '#808000', '#d4145a'
  ];  
  const cards = document.querySelectorAll('.eh-parent');

  cards.forEach(card => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    card.querySelector('.eh-content-box').style.backgroundColor = randomColor;
  });
});


function asistirEvento(eventoId) {
  //console.log(eventoId);
  const user_container = document.getElementById("user_container");
  //console.log(user_container);
  const username = user_container.getAttribute("data-username");
  if (!username) {
      alert('No estás autenticado o no se ha proporcionado el nombre de usuario.');
      return;
  }

  fetch(`/eventos/${eventoId}/asistente`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          username: username
      })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.mensaje);  
  })
  .catch(error => {
      console.error('Error:', error);
  });
}


function editUser(userId){
  window.location.href = `/users/${userId}`;
}

  
function toggleEditMode() {
  const properties = ['fullname', 'username', 'email', 'role'];

  properties.forEach(property => {
      const span = document.getElementById(property);
      const input = document.getElementById(`edit-${property}`);
      if (input.type !== 'file') {
          input.value = span.innerText;
      } else {
          input.src = span.innerText;
      }
      if (input.style.display === 'none') {
          span.style.display = 'none';
          input.style.display = 'inline-block';
      } else {
          span.style.display = 'inline-block';
          input.style.display = 'none';
      }
  });
  const img = document.getElementById('profilePicture');
  const fileInput = document.getElementById('edit-profilePicture');
  img.style.display = img.style.display === 'none' ? 'block' : 'none';
  fileInput.style.display = fileInput.style.display === 'none' ? 'block' : 'none';

  const editButton = document.querySelector('.btn-edit');
  const updateButton = document.querySelector('.btn-update');

  if (editButton.style.display === 'none') {
      editButton.style.display = 'inline-block';
      updateButton.style.display = 'none';
  } else {
      editButton.style.display = 'none';
      updateButton.style.display = 'inline-block';
  }
}

function previewImage(event) {
  const [file] = event.target.files;
  if (file) {
    const img = document.getElementById('profilePicture');
    img.src = URL.createObjectURL(file);
  }
}

async function updateUser(userId) {
  const newData = {
    fullname: document.getElementById('edit-fullname').value,
    username: document.getElementById('edit-username').value,
    email: document.getElementById('edit-email').value,
    role: document.getElementById('edit-role').value
  };
  const profilePictureInput = document.getElementById('edit-profilePicture');

  try {
    if (profilePictureInput.files.length > 0) {
      await updateProfilePicture(userId);
    }

    const response = await fetch(`/users/update/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, newData })
    });

    if (response.ok) {
      window.location.href = `/users/${userId}`;
    } else {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    alert('Error al actualizar el usuario: ' + error.message);
  }
}

async function updateUser2(userId) {
const newData = {
    fullname: document.getElementById('edit-fullname').value,
    username: document.getElementById('edit-username').value,
    email: document.getElementById('edit-email').value,
    role: document.getElementById('edit-role').value
  };
  const profilePictureInput = document.getElementById('edit-profilePicture');

  try {
    if (profilePictureInput.files.length > 0) {
      await updateProfilePicture(userId);
    }

    const respuesta = await fetch(`/usuarios/actualizar/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData) 
    });

    if (respuesta.ok) {
      window.location.href = `/miperfil`;
    } else {
      throw new Error('La respuesta de la red no fue correcta');
    }
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    alert('Error al actualizar el usuario: ' + error.message);
  }
}


function updateProfilePicture(userId) {
  const input = document.getElementById('edit-profilePicture');
  if (input.files.length === 0) {
      alert('Por favor, selecciona una imagen para subir.');
      return;
  }
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file); 

  fetch(`/perfil/foto/${userId}`, {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      if (data.profilePicture) {
          alert('Foto de perfil actualizada con éxito.');
          document.getElementById('profilePicture').src = data.profilePicture;
      } else {
          throw new Error(data.mensaje);
      }
  })
  .catch(error => {
      console.error('Error al actualizar la foto de perfil:', error);
      alert('Error al actualizar la foto de perfil: ' + error.message);
  });
}


function deleteUser(userId) {
  if(confirm("¿Está seguro de que quiere eliminar este usuario?")) {
    fetch(`/users/delete/${userId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
          window.location.href = `/usersLists`;
      } else {
          throw new Error('Network response was not ok');
      }
    })
    .catch(error => {
      console.error('Error deleting user:', error);
      res.status(500).send('Error eliminando usuario');
    });
  }
}

function deleteEvent(eventId){
  if(confirm("¿Está seguro de que quiere eliminar este evento?")) {
    fetch(`/eventos/${eventId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
          window.location.href = `/`;
      } else {
          throw new Error('Network response was not ok');
      }
    })
    .catch(error => {
      console.error('Error deleting event:', error);
      res.status(500).send('Error eliminando evento');
    });
  }
}
function toggleModal(show) {
  const modal = document.getElementById('createProjectModal');
  modal.style.display = show ? 'block' : 'none';
}



document.getElementById('inputField').addEventListener('input', filterEvents);

function filterEvents() {
    var searchValue = document.getElementById('inputField').value.toLowerCase();
    var eventCards = document.querySelectorAll('.eh-parent');

    eventCards.forEach(card => {
        var title = card.querySelector('.eh-card-title').textContent.toLowerCase();
        if (title.includes(searchValue)) {
            card.style.display = ''; 
        } else {
            card.style.display = 'none'; 
        }
    });
}

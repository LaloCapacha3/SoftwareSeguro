# EventHorizon
Plataforma de Eventos y Networking Online.  Un espacio virtual para organizar eventos, conferencias y facilitar el networking entre los participantes. 


# .env
PORT = 3000 
logs = info 
NODE_ENV=dev
DB_URL = "mongodb+srv://edumex_user:admin@myapp.hl9htyx.mongodb.net/EventHorizon?retryWrites=true&w=majority" 
JWT_SECRET = "b687f06e51ef14e9131ddcebef6c2b82d270c79c3b03d1c749476401752c2386731824e17086c1f209f1d0030c0cc574f5eecf36315fb864b122c6fdce1537f0"

AWS_ACCESS_KEY_ID= AKIAZQ3DUZ6YPAJJG4XP
AWS_SECRET_ACCESS_KEY= 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
AWS_BUCKET_NAME= eventhorizon
AWS_REGION= us-east-2

GOOGLE_ID = 713891068216-0cka6s5n0l2rcf0i0s7tcbb0vuh17as1.apps.googleusercontent.com
GOOGLE_SECRET = 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
SECRET_KEY = admin
GOOGLE_CALLBACK=http://localhost:3000/google/callback

#amazon:
#Console login URL
#https://654654623664.signin.aws.amazon.com/console
#Username
#FerreiraPapi
#Console password
#Deuteronomy 1



# pruebas

Para estas pruebas, puedes probar iniciando sesion desde el front con un usuario que crees asi pruebas los 2 primeros puntos 
Endpoint para registro de un nuevo usuario
Endpoint para inicio de sesión
Creación de token
en la consola veras tu token para ponerl en thunder o postman de esta forma en headers:
![alt text](ejemplos/image-1.png)
ahi ya podras meter esta ruta:
http://localhost:3000/perfil/foto
Middleware para validar autenticación
Endpoint para subir la foto de perfil del usuario logueado (a un bucket de S3)
que ese mismo ya prueba los 2 puntos y da de resultado ese response:
![alt text](ejemplos/image.png)
en la bd esto:
![alt text](ejemplos/image-2.png)
y en aws esto:
![alt text](ejemplos/image-3.png)
y para crear el punto de roles puedes usar cualquiera de estas rutas:
http://localhost:3000/users

esta la usas para ver el swagger:
http://localhost:3000/api-docs/

lo unico nuevo son todas las rutas de admin, y tienes que mover el .env para tener las credenciales de la api de google, y para probarlo tan facil como picarle al boton de google y listo, ademas de que te vallas a eventos los colores son aleatorios.

# socket 

para la implementacion de socket solo instala las librerias, que te falten json y entras a networking y en una session en incognito te metes en otra cuenta, y seleccionas las 2 cuentas entre si, y ya veras los mensajes.
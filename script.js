// Contenedor para todas las funciones
const game = {
    // Función de inicialización
    init() {
                // Aquí va la configuración inicial de la escena
                // Crear la escena de Three.js
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xffffff);
            // Crear la cámara y establecer la posición inicial
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;

            // Crear el renderizador
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // Crear el personaje y establecer su posición y rotación inicial
            character = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            character.position.set(0, -1, 0);
            character.rotation.y = Math.PI / 4;
            scene.add(character);

            // Crear las figuras geométricas y establecer sus posiciones iniciales
            createShapes();
            shapes.forEach(function (shape) {
                scene.add(shape);
            });

            const armLeftElem = document.querySelector('.arm-left');
            const armRightElem = document.querySelector('.arm-right');
            
            const armLeftObject = new THREE.CSS3DObject(armLeftElem);
            const armRightObject = new THREE.CSS3DObject(armRightElem);
            
            scene.add(armLeftObject);
            scene.add(armRightObject);
            
            // En la función animate()
            armLeftObject.position.set(x, y, z);
            armLeftObject.rotation.set(rx, ry, rz);
            
            armRightObject.position.set(x, y, z);
            armRightObject.rotation.set(rx, ry, rz);


            // Crear la luz
            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.set(0, 0, 5);
            scene.add(light);

            // Añadir el listener del teclado para el movimiento del personaje
            document.addEventListener('keydown', handleInput);

            // Actualizar la interfaz de usuario
            updateUI();
    },
  
    // Función de animación
    animate() {
      // Aquí se actualiza el renderizado en cada cuadro
      requestAnimationFrame(animate);
    },
  
    // Función para hacer que el personaje camine
    walk() {
          // Crear una animación Tween para el movimiento del personaje
        const tween = new TWEEN.Tween({ x: 0 })
            .to({ x: 1 }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
            // Actualizar la posición del personaje en la escena
            character.position.x = tween._object.x * 10 - 5;
            })
            .start();

            var walkingTween = new TWEEN.Tween(character.position)
            .to({ x: targetX, z: targetZ }, walkingSpeed)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(function() {
              // Al terminar la animación, detenemos la caminata
              isWalking = false;
            });
        
          // Iniciamos la animación
          walkingTween.start();    
    },
  
    // Función para detectar colisiones
    detectCollisions() {
      // Aquí se utiliza Ammo.js o Cannon.js para detectar colisiones
      // Variables globales
    let collisionConfiguration, dispatcher, overlappingPairCache, solver, physicsWorld;

    function initPhysics() {
    // Configuración de la detección de colisiones
    collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    overlappingPairCache = new Ammo.btDbvtBroadphase();
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    
    // Creación del mundo de física
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0)); // Gravedad hacia abajo
    }

    function detectCollisions() {
        // Actualizar el mundo de física
        physicsWorld.stepSimulation(deltaTime, 10);
        
        // Detección de colisiones entre el personaje y las figuras geométricas
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            
            let transform = new Ammo.btTransform();
            shape.rigidBody.getMotionState().getWorldTransform(transform);
            
            let position = transform.getOrigin();
            let distance = Math.sqrt(Math.pow(position.x() - player.position.x, 2) + Math.pow(position.y() - player.position.y, 2) + Math.pow(position.z() - player.position.z, 2));
            
            if (distance < player.scale * 10) {
            // Colisión detectada
            // Restar una vida al jugador
            playerLives--;
            
            // Eliminar la figura geométrica
            physicsWorld.removeRigidBody(shape.rigidBody);
            scene.remove(shape.mesh);
            shapes.splice(i, 1);
            
            // Actualizar la UI
            updateLives();
            
            // Comprobar si el jugador ha perdido todas sus vidas
            if (playerLives == 0) {
                gameOver();
            }
            }
        }
        }
    },
  
    // Función para actualizar el puntaje del jugador
    updateScore() {
        // Aquí se actualiza el puntaje del jugador
        score += 10; // Incrementar el puntaje del jugador en 10 puntos
        scoreElement.innerHTML = `Score: ${score}`; // Actualizar el elemento HTML con el nuevo puntaje
        if (score % 100 === 0) { // Comprobar si el jugador ha alcanzado un múltiplo de 100 puntos
            increaseSpeed(); // Incrementar la velocidad de las figuras geométricas
        }
    },
  
    // Función para actualizar la cantidad de vidas del jugador
    updateLives() {
            // Aquí se actualiza la cantidad de vidas del jugador
                // Actualizar la cantidad de vidas
        playerLives -= delta;

        // Si se han perdido todas las vidas, mostrar el mensaje de Game Over y reiniciar el juego
        if (playerLives <= 0) {
            gameOver();
        }

        // Actualizar la interfaz de usuario
        updateUI();
    },
  
    // Función para reiniciar el juego
    resetGame() {
            // Aquí se reinicia el juego
                // Reiniciar las vidas del jugador a 5
        lives = 5;

        // Reiniciar la puntuación del jugador a 0
        score = 0;

        // Reiniciar la posición del jugador
        player.position.set(0, 0, 0);

        // Eliminar todas las figuras geométricas del escenario
        while (shapes.length > 0) {
            let shape = shapes.pop();
            scene.remove(shape.mesh);
        }

        // Reiniciar la velocidad de las figuras geométricas a su valor original
        shapeVelocity = originalShapeVelocity;

        // Reiniciar el mensaje de Game Over
        gameOverMessage.style.display = "none";
    },
  
    // Función para actualizar la interfaz de usuario
    updateUI() {
      // Aquí se actualiza la interfaz de usuario con el puntaje y las vidas del jugador
        // Obtener los elementos de HTML para mostrar el puntaje y las vidas del jugador
        const scoreEl = document.getElementById("score");
        const livesEl = document.getElementById("lives");

        // Actualizar el contenido de los elementos HTML con los valores actuales del puntaje y las vidas
        scoreEl.textContent = `Score: ${score}`;
        livesEl.textContent = `Lives: ${lives}`;
    },
  
    // Función del bucle del juego
    gameLoop() {
      // Aquí se controla el bucle del juego y se llaman a las funciones correspondientes
      function gameLoop() {
        requestAnimationFrame(gameLoop);
      
        // Mover al personaje
        walk();
      
        // Detectar colisiones
        detectCollisions();
      
        // Actualizar la puntuación y las vidas
        updateScore();
        updateLives();
      
        // Actualizar la interfaz de usuario
        updateUI();
      
        // Si no hay vidas restantes, reiniciar el juego
        if (lives === 0) {
          resetGame();
        }
      
        // Incrementar la velocidad cada 10 figuras esquivadas
        if (score !== 0 && score % 10 === 0 && speed < maxSpeed) {
          speed = getNextFibonacci(speed);
        }
      
        // Actualizar la posición de las figuras geométricas
        for (let i = 0; i < objects.length; i++) {
          objects[i].position.z += speed;
          objects[i].material.opacity = getOpacity(objects[i]);
        }
      
        // Actualizar el renderizado
        renderer.render(scene, camera);
      }
    },
  
    // Función para manejar la entrada del jugador
    handleInput() {
      // Aquí se maneja la entrada del jugador
          // Si se presiona la tecla de flecha hacia arriba, avanzar hacia adelante
        if (keys.ArrowUp) {
            if (!walking) {
            walking = true;
            walkTween.play();
            }
            // Avanzar hacia adelante en la dirección del personaje
            var velocity = new THREE.Vector3();
            camera.getWorldDirection(velocity);
            velocity.y = 0;
            velocity.normalize();
            velocity.multiplyScalar(0.2);
            camera.position.add(velocity);
        }
        // Si se presiona la tecla de flecha hacia abajo, avanzar hacia atrás
        if (keys.ArrowDown) {
            if (!walking) {
            walking = true;
            walkTween.play();
            }
            // Retroceder en la dirección opuesta al personaje
            var velocity = new THREE.Vector3();
            camera.getWorldDirection(velocity);
            velocity.y = 0;
            velocity.normalize();
            velocity.multiplyScalar(-0.1);
            camera.position.add(velocity);
        }
        // Si se presiona la tecla de flecha hacia la izquierda, girar hacia la izquierda
        if (keys.ArrowLeft) {
            camera.rotateY(0.1);
        }
        // Si se presiona la tecla de flecha hacia la derecha, girar hacia la derecha
        if (keys.ArrowRight) {
            camera.rotateY(-0.1);
        }
    },
  
    // Función que se llama cuando el jugador pierde todas sus vidas
    gameOver() {
      // Aquí se muestra un mensaje de Game Over en la pantalla
      function gameOver() {
        // Mostrar el mensaje de Game Over
        const gameOverMsg = document.createElement('div');
        gameOverMsg.classList.add('game-over');
        gameOverMsg.innerHTML = 'Game Over';
      
        gameContainer.appendChild(gameOverMsg);
      
        // Reiniciar el juego después de un tiempo
        setTimeout(() => {
          resetGame();
        }, 3000);
      }
    }
  }
        let numShapes = 10;
        let minCoord = -50;
        let maxCoord = 50;
        let maxDistance = 50;
        let minDistance = 10;
        let shapes = [];
  function createShapes() {
    // Creamos las figuras geométricas
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const shapes = [];
  
    for (let i = 0; i < numShapes; i++) {
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        Math.random() * (maxCoord - minCoord) + minCoord,
        Math.random() * (maxCoord - minCoord) + minCoord,
        Math.random() * (maxCoord - minCoord) + minCoord
      );
      shapes.push(shape);
      scene.add(shape);
    }
  
    return shapes;
  }

  function createRandomShape() {
    const shapeType = Math.floor(Math.random() * 4); // Generar un número aleatorio entre 0 y 3
    const geometry = getRandomGeometry(); // Obtener una geometría aleatoria
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Definir el material con el color rojo
  
    // Crear la figura geométrica según el tipo seleccionado
    switch (shapeType) {
      case 0:
        shape = new THREE.Mesh(geometry, material);
        break;
      case 1:
        shape = new THREE.CubeGeometry(5, 5, 5);
        break;
      case 2:
        shape = new THREE.SphereGeometry(5, 32, 32);
        break;
      case 3:
        shape = new THREE.CylinderGeometry(5, 5, 10, 32);
        break;
    }
    // Definir la posición aleatoria de la figura geométrica
    shape.position.x = Math.random() * (maxCoord - minCoord) + minCoord;
    shape.position.y = Math.random() * (maxCoord - minCoord) + minCoord;
    shape.position.z = Math.random() * (maxCoord - minCoord) + minCoord;
    const velocity = getVelocityTowardsPlayer(position);
    shape.position.set(position.x, position.y, position.z);
    shape.velocity = velocity;
    // Retornar la figura geométrica creada
    return shape;
  }
  
  function moveShapes() {
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      const direction = new THREE.Vector3().subVectors(shape.position, player.position);
      const distance = direction.length();
  
      if (distance < minDistance) {
        // Game over
        resetGame();
      } else if (distance < maxDistance) {
        // Mover la figura hacia el jugador
        const speed = 1 / distance;
        direction.normalize();
        direction.multiplyScalar(speed);
        shape.position.sub(direction);
        shape.material.opacity = Math.max(0, 1 - distance / maxDistance);
      }
    }
  }

        // Función para actualizar la posición de las figuras geométricas
        function updateShapesPosition() {
            for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            let direction = new THREE.Vector3();
            direction.subVectors(player.position, shape.position);
            let distance = direction.length();
            if (distance > maxDistance) {
                direction.normalize();
                let moveDistance = distance - maxDistance;
                shape.position.addScaledVector(direction, moveDistance);
            } else if (distance < minDistance) {
                direction.normalize();
                let moveDistance = minDistance - distance;
                shape.position.addScaledVector(direction, -moveDistance);
            }
            shape.material.opacity = 1 - (distance - minDistance) / (maxDistance - minDistance);
            }
        }
        
        // Función para actualizar la cantidad de figuras geométricas
        function updateNumShapes() {
            numShapes += 10;
            for (let i = 0; i < 10; i++) {
            shapes.push(createRandomShape());
            scene.add(shapes[shapes.length - 1]);
            }
        }
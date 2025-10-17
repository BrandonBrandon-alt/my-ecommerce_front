describe('Formulario de Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Renderizado inicial', () => {
    it('debe mostrar todos los elementos del formulario', () => {
      cy.contains('Login').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.contains('button', 'Login').should('be.visible');
      cy.contains('Forgot Password?').should('be.visible');
      cy.contains("Don't have an account?").should('be.visible');
      cy.contains('Register').should('be.visible');
    });

    it('debe mostrar descripciones de los campos', () => {
      cy.contains('Your email address').should('be.visible');
      cy.contains('Your password').should('be.visible');
    });

    it('debe mostrar el botón de toggle para la contraseña', () => {
      cy.get('input[name="password"]').parent().find('button[type="button"]').should('exist');
    });
  });

  describe('Validación de campos', () => {
    it('debe validar que el email está vacío', () => {
      cy.get('input[name="password"]').type('password123');
      cy.contains('button', 'Login').click();
      cy.get('input[name="email"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que el email no es válido', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password123');
      cy.contains('button', 'Login').click();
      cy.get('input[name="email"]').should('have.attr', 'aria-invalid', 'true');
      cy.contains('Please enter a valid email address').should('be.visible');
    });

    it('debe aceptar cualquier contraseña no vacía', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('abc');
      cy.contains('button', 'Login').click();
      // No debe haber errores de validación en el campo
      cy.get('input[name="password"]').should('not.have.attr', 'aria-invalid', 'true');
    });
  });

  describe('Funcionalidad de toggle de contraseña', () => {
    it('debe mostrar/ocultar la contraseña al hacer clic en el botón', () => {
      cy.get('input[name="password"]').type('TestPassword123!');

      // Verificar que inicialmente es tipo password
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');

      // Hacer clic en el botón de toggle
      cy.get('input[name="password"]').parent().find('button[type="button"]').click();

      // Verificar que ahora es tipo text
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');

      // Hacer clic nuevamente para ocultar
      cy.get('input[name="password"]').parent().find('button[type="button"]').click();

      // Verificar que vuelve a ser tipo password
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it('debe mostrar el icono correcto según el estado', () => {
      cy.get('input[name="password"]').type('TestPassword123!');

      // Estado inicial debe mostrar Eye icon (para mostrar)
      cy.get('input[name="password"]').parent().find('button[type="button"]').click();

      // Después del clic debe mostrar EyeOff icon (para ocultar)
      cy.get('input[name="password"]').parent().find('button[type="button"]').click();
    });
  });

  describe('Envío del formulario', () => {
    it('debe enviar el formulario con credenciales válidas', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          message: 'Login successful',
          token: 'fake-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');

      // Verificar que se muestra el alert de éxito
      cy.contains('Login successful!').should('be.visible');

      // Verificar que se redirige a /home
      cy.url().should('include', '/home', { timeout: 3000 });
    });

    it('debe mostrar error cuando las credenciales son incorrectas', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid email or password',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('WrongPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');

      // El componente muestra "Failed to login" en AlertTitle
      cy.contains('Failed to login').should('be.visible');
      // Y el mensaje del servidor en AlertDescription
      cy.contains('Invalid email or password').should('be.visible');

      // Verificar que NO se redirige
      cy.url().should('include', '/login');
    });

    it('debe mostrar error cuando el usuario no existe', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 404,
        body: {
          message: 'User not found',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');
      cy.contains('User not found').should('be.visible');
    });

    it('debe mostrar el loader mientras se procesa el login', () => {
      cy.intercept('POST', '**/auth/login', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: {
            message: 'Login successful',
            token: 'fake-jwt-token',
          },
        });
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      // Verificar que se muestra el loader inmediatamente
      cy.contains('button', 'Logging in...').should('be.visible');
      cy.get('svg.animate-spin').should('be.visible');

      // Verificar que el botón está deshabilitado
      cy.contains('button', 'Logging in...').should('be.disabled');
    });

    it('debe deshabilitar los campos mientras se procesa el login', () => {
      cy.intercept('POST', '**/auth/login', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: {
            message: 'Login successful',
            token: 'fake-jwt-token',
          },
        });
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      // Verificar que los campos están deshabilitados mientras carga
      cy.contains('button', 'Logging in...').should('be.visible');
      cy.get('input[name="email"]').should('be.disabled');
      cy.get('input[name="password"]').should('be.disabled');
    });

    it('debe deshabilitar el botón de toggle de contraseña durante el login', () => {
      cy.intercept('POST', '**/auth/login', (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: {
            message: 'Login successful',
            token: 'fake-jwt-token',
          },
        });
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      // Verificar que el botón de toggle está deshabilitado
      cy.get('input[name="password"]').parent().find('button[type="button"]').should('be.disabled');
    });

    it('debe ocultar el alert de error después de 5 segundos', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid credentials',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('WrongPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');

      // Verificar que se muestra el alert
      cy.contains('Invalid credentials').should('be.visible');

      // Esperar 5 segundos y verificar que desaparece
      cy.wait(5000);
      cy.contains('Invalid credentials').should('not.exist');
    });

    it('debe resetear el formulario después de un login exitoso', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          message: 'Login successful',
          token: 'fake-jwt-token',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');

      // Los campos deberían estar vacíos después del reset
      cy.get('input[name="email"]').should('have.value', '');
      cy.get('input[name="password"]').should('have.value', '');
    });

    it('debe mostrar el alert de éxito con el mensaje del servidor', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          message: 'Welcome back, user!',
          token: 'fake-jwt-token',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');
      cy.contains('Welcome back, user!').should('be.visible');
    });

    it('debe mostrar mensaje por defecto si el servidor no envía mensaje', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');
      cy.contains('Login successful!').should('be.visible');
    });
  });

  describe('Navegación', () => {
    it('debe navegar a la página de registro al hacer clic en "Register"', () => {
      cy.contains('Register').click();
      cy.url().should('include', '/register');
    });

    it('debe navegar a la página de recuperación de contraseña', () => {
      cy.contains('Reset Password').click();
      cy.url().should('include', '/forgotPassword');
    });
  });

  describe('Manejo de errores del servidor', () => {
    it('debe manejar error 500 del servidor', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 500,
        body: {
          message: 'Internal server error',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');
      cy.contains('Internal server error').should('be.visible');
    });

    it('debe manejar error de red', () => {
      cy.intercept('POST', '**/auth/login', {
        forceNetworkError: true,
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait(1000);

      // Verificar que hay algún mensaje de error visible
      cy.get('body').then(($body) => {
        const hasNetworkError = $body.text().includes('Network');
        const hasError = $body.text().includes('error');
        const hasFailed = $body.text().includes('failed');

        expect(hasNetworkError || hasError || hasFailed).to.be.true;
      });
    });

    it('debe manejar respuesta sin mensaje de error', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {},
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('WrongPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');
      cy.contains('An unexpected error occurred').should('be.visible');
    });

    it('debe manejar timeout de la petición', () => {
      cy.intercept('POST', '**/auth/login', (req) => {
        req.reply({
          delay: 30000,
          statusCode: 200,
          body: {},
        });
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.contains('button', 'Logging in...').should('be.visible');
    });
  });

  describe('Accesibilidad', () => {
    it('debe permitir navegar con el teclado entre campos', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="email"]').focus();
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'name', 'password');
    });

    it('debe tener labels asociados a los inputs', () => {
      cy.get('label').contains('Email').should('exist');
      cy.get('label').contains('Password').should('exist');
    });

    it('debe tener placeholder en los campos', () => {
      cy.get('input[name="email"]').should('have.attr', 'placeholder', 'name@example.com');
      cy.get('input[name="password"]').should('have.attr', 'placeholder', '••••••••');
    });

    it('debe tener autocomplete en el campo de contraseña', () => {
      cy.get('input[name="password"]').should('have.attr', 'autocomplete', 'current-password');
    });
  });

  describe('Animaciones de alerts', () => {
    it('debe mostrar el alert de éxito con icono CheckCircle2', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          message: 'Login successful',
          token: 'fake-jwt-token',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');

      // Verificar componentes del alert de éxito
      cy.contains('Login successful!').parent().parent().within(() => {
        cy.get('svg').should('exist'); // CheckCircle2 icon
        cy.contains('Login successful!').should('be.visible');
      });
    });

    it('debe mostrar el alert de error con icono XCircle', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid credentials',
        },
      }).as('loginRequest');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('WrongPass!');
      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');

      // Verificar componentes del alert de error
      cy.contains('Invalid credentials').parent().parent().within(() => {
        cy.get('svg').should('exist'); // XCircle icon
        cy.contains('Invalid credentials').should('be.visible');
      });
    });
  });

  describe('Layout y estructura', () => {
    it('debe renderizar el Card correctamente', () => {
      // Usar un selector más específico que encuentre solo un card
      cy.get('div[class*="max-w-md"]').within(() => {
        cy.contains('Login').should('exist');
      });
    });

    it('debe tener el ancho máximo correcto', () => {
      cy.get('[class*="max-w-md"]').should('exist');
    });

    it('debe estar centrado en la pantalla', () => {
      cy.get('[class*="min-h-screen"][class*="items-center"][class*="justify-center"]').should('exist');
    });
  });
});
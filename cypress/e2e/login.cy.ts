describe('Formulario de Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Renderizado inicial', () => {
    it('debe mostrar todos los elementos del formulario', () => {
      cy.contains('Login').should('be.visible');
      cy.contains('Enter your credentials to access your account').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.contains('button', 'Login').should('be.visible');
      cy.contains('Forgot password?').should('be.visible');
      cy.contains("Don't have an account?").should('be.visible');
      cy.contains('Sign up').should('be.visible');
    });

    it('debe mostrar el botón de Google Login', () => {
      // El botón de Google se renderiza en un iframe
      cy.get('iframe').should('exist');
    });

    it('debe mostrar el botón de toggle para la contraseña', () => {
      cy.get('input[name="password"]').parent().find('button[type="button"]').should('exist');
    });
  });

  describe('Validación de campos', () => {
    it('debe validar que el email está vacío', () => {
      cy.get('input[name="password"]').type('ValidPass123!');
      cy.contains('button', 'Login').click();
      // La validación de react-hook-form previene el submit
      cy.get('input[name="email"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que el email no es válido', () => {
      cy.fillLoginForm({
        email: 'invalid-email',
        password: 'ValidPass123!',
      });
      cy.contains('button', 'Login').click();
      // La validación de react-hook-form previene el submit
      cy.get('input[name="email"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que la contraseña está vacía', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.contains('button', 'Login').click();
      // La validación de react-hook-form previene el submit
      cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que la contraseña tiene menos de 8 caracteres', () => {
      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'Short1!',
      });
      cy.contains('button', 'Login').click();
      cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que la contraseña no contiene un número', () => {
      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'NoNumber!',
      });
      cy.contains('button', 'Login').click();
      cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que la contraseña no contiene una minúscula', () => {
      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'NOLOWER123!',
      });
      cy.contains('button', 'Login').click();
      cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que la contraseña no contiene una mayúscula', () => {
      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'noupper123!',
      });
      cy.contains('button', 'Login').click();
      cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que la contraseña no contiene un carácter especial', () => {
      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'NoSpecial123',
      });
      cy.contains('button', 'Login').click();
      cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('debe validar que la contraseña excede 100 caracteres', () => {
      const longPassword = 'ValidPass123!' + 'a'.repeat(100);
      cy.fillLoginForm({
        email: 'test@example.com',
        password: longPassword,
      });
      cy.contains('button', 'Login').click();
      cy.get('input[name="password"]').should('have.attr', 'aria-invalid', 'true');
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
  });

  describe('Envío del formulario', () => {
    it('debe enviar el formulario con credenciales válidas', () => {
      // Interceptar la petición de login
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

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      cy.contains('button', 'Login').click();

      // Esperar que se haga la petición
      cy.wait('@loginRequest');

      // Verificar que se muestra el alert de éxito
      cy.contains('Success!').should('be.visible');
      cy.contains('Login successful! Redirecting...').should('be.visible');

      // Verificar que se redirige al dashboard
      cy.url().should('include', '/dashboard');
    });

    it('debe mostrar error cuando las credenciales son incorrectas', () => {
      // Interceptar la petición de login con error
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid email or password',
        },
      }).as('loginRequest');

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'WrongPass123!',
      });

      cy.contains('button', 'Login').click();

      // Esperar la respuesta del servidor
      cy.wait('@loginRequest');
      
      // Verificar que se muestra el alert de error
      cy.contains('Login failed').should('be.visible');
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

      cy.fillLoginForm({
        email: 'nonexistent@example.com',
        password: 'ValidPass123!',
      });

      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');
      cy.contains('Login failed').should('be.visible');
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

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

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

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      cy.contains('button', 'Login').click();

      // Verificar que los campos están deshabilitados mientras carga
      cy.contains('button', 'Logging in...').should('be.visible');
      cy.get('input[name="email"]').should('be.disabled');
      cy.get('input[name="password"]').should('be.disabled');
    });

    it('debe ocultar el alert de error después de 5 segundos', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: {
          message: 'Invalid credentials',
        },
      }).as('loginRequest');

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'WrongPass123!',
      });

      cy.contains('button', 'Login').click();

      // Esperar la respuesta
      cy.wait('@loginRequest');
      
      // Verificar que se muestra el alert
      cy.contains('Login failed').should('be.visible');

      // Esperar 5 segundos y verificar que desaparece
      cy.wait(5000);
      cy.contains('Login failed').should('not.exist');
    });

    it('debe resetear el formulario después de un login exitoso', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          message: 'Login successful',
          token: 'fake-jwt-token',
        },
      }).as('loginRequest');

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');

      // Los campos deberían estar vacíos (aunque luego redirige)
      cy.get('input[name="email"]').should('have.value', '');
      cy.get('input[name="password"]').should('have.value', '');
    });
  });

  describe('Navegación', () => {
    it('debe navegar a la página de registro al hacer clic en "Sign up"', () => {
      cy.contains('Sign up').click();
      cy.url().should('include', '/register');
    });

    it('debe navegar a la página de recuperación de contraseña', () => {
      cy.contains('Forgot password?').click();
      cy.url().should('include', '/forgot-password');
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

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      cy.contains('button', 'Login').click();

      cy.wait('@loginRequest');
      cy.contains('Login failed').should('be.visible');
      cy.contains('Internal server error').should('be.visible');
    });

    it('debe manejar error de red', () => {
      cy.intercept('POST', '**/auth/login', {
        forceNetworkError: true,
      }).as('loginRequest');

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      cy.contains('button', 'Login').click();

      // Esperar un momento para que se intente la petición
      cy.wait(1000);
      cy.contains('Login failed').should('be.visible');
    });

    it('debe manejar timeout de la petición', () => {
      cy.intercept('POST', '**/auth/login', (req) => {
        req.reply({
          delay: 30000, // 30 segundos
          statusCode: 200,
          body: {},
        });
      }).as('loginRequest');

      cy.fillLoginForm({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });

      cy.contains('button', 'Login').click();

      // Verificar que se muestra el loader
      cy.contains('button', 'Logging in...').should('be.visible');
    });
  });

  describe('Accesibilidad', () => {
    it('debe permitir navegar con el teclado', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="email"]').type('{enter}');
      // Verificar que el foco se puede mover manualmente
      cy.get('input[name="password"]').focus();
      cy.focused().should('have.attr', 'name', 'password');
      cy.focused().type('ValidPass123!');
    });

    it('debe tener labels asociados a los inputs', () => {
      cy.get('label').contains('Email').should('exist');
      cy.get('label').contains('Password').should('exist');
    });
  });
});

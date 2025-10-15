describe('Formulario de Registro Multi-Step', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  describe('Navegación entre pasos', () => {
    it('debe mostrar el paso 1 inicialmente', () => {
      cy.contains('Personal Info').should('be.visible');
      cy.contains('Basic information').should('be.visible');
      cy.get('input[name="idNumber"]').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
    });

    it('debe avanzar al paso 2 cuando los datos del paso 1 son válidos', () => {
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });

      cy.contains('button', 'Next').click();

      // Verificar que estamos en el paso 2
      cy.contains('Contact').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="phoneNumber"]').should('be.visible');
    });

    it('debe avanzar al paso 3 cuando los datos del paso 2 son válidos', () => {
      // Llenar paso 1
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      // Llenar paso 2
      cy.fillRegistrationStep2({
        email: 'john.doe@test.com',
        phoneNumber: '+1234567890',
      });
      cy.contains('button', 'Next').click();

      // Verificar que estamos en el paso 3
      cy.contains('Security').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      // Esperar a que el checkbox exista y luego verificar
      cy.get('input[type="checkbox"]').should('exist');
      cy.contains('I agree to the').scrollIntoView().should('be.visible');
    });

    it('debe permitir retroceder al paso anterior', () => {
      // Avanzar al paso 2
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      // Retroceder al paso 1
      cy.contains('button', 'Back').click();

      // Verificar que estamos en el paso 1
      cy.contains('Personal Info').should('be.visible');
      cy.get('input[name="idNumber"]').should('have.value', '123456789');
    });

    it('debe mantener los datos al navegar entre pasos', () => {
      // Llenar paso 1
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      // Llenar paso 2
      cy.fillRegistrationStep2({
        email: 'john.doe@test.com',
      });
      cy.contains('button', 'Next').click();

      // Retroceder al paso 2
      cy.contains('button', 'Back').click();
      cy.get('input[name="email"]').should('have.value', 'john.doe@test.com');

      // Retroceder al paso 1
      cy.contains('button', 'Back').click();
      cy.get('input[name="idNumber"]').should('have.value', '123456789');
      cy.get('input[name="name"]').should('have.value', 'John');
      cy.get('input[name="lastName"]').should('have.value', 'Doe');
    });
  });

  describe('Validación de campos', () => {
    it('no debe avanzar del paso 1 si los campos están vacíos', () => {
      cy.contains('button', 'Next').click();

      // Debe mostrar mensajes de error
      cy.contains('ID number must be at least 2 characters').should('be.visible');
      cy.contains('Name must be at least 2 characters').should('be.visible');
      cy.contains('Last name must be at least 2 characters').should('be.visible');

      // No debe avanzar al paso 2
      cy.get('input[name="email"]').should('not.exist');
    });

    it('debe validar el formato del ID number', () => {
      cy.get('input[name="idNumber"]').type('1');
      cy.get('input[name="name"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.contains('button', 'Next').click();

      cy.contains('ID number must be at least 2 characters').should('be.visible');
    });

    it('no debe avanzar del paso 2 si el email es inválido', () => {
      // Llenar paso 1
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      // Intentar con email inválido
      cy.get('input[name="email"]').type('invalid-email');
      cy.contains('button', 'Next').click();

      cy.contains('Please enter a valid email address').should('be.visible');
    });

    it('debe validar que las contraseñas coincidan', () => {
      // Llenar pasos 1 y 2
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'john.doe@test.com',
      });
      cy.contains('button', 'Next').click();

      // Llenar contraseñas diferentes
      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('input[name="confirmPassword"]').type('Different123!@#');
      cy.contains('I agree to the').scrollIntoView();
      cy.get('input[type="checkbox"]').check({ force: true });
      cy.contains('button', 'Create Account').click();

      cy.contains("Passwords don't match").should('be.visible');
    });

    it('debe validar la complejidad de la contraseña', () => {
      // Llenar pasos 1 y 2
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'john.doe@test.com',
      });
      cy.contains('button', 'Next').click();

      // Contraseña débil
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="confirmPassword"]').type('weak');
      cy.contains('I agree to the').scrollIntoView();
      cy.get('input[type="checkbox"]').check({ force: true });
      cy.contains('button', 'Create Account').click();

      // Debe mostrar errores de validación de contraseña
      cy.contains(/Password must/i).should('be.visible');
    });

    it('debe requerir aceptar términos y condiciones', () => {
      // Llenar todos los pasos sin aceptar términos
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'john.doe@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.get('input[name="password"]').type('Test123!@#');
      cy.get('input[name="confirmPassword"]').type('Test123!@#');
      // NO marcar el checkbox
      cy.contains('button', 'Create Account').click();

      cy.contains('You must accept the terms and conditions').should('be.visible');
    });
  });

  describe('Indicador de progreso', () => {
    it('debe mostrar el progreso visual correctamente', () => {
      // Paso 1 - primer círculo activo
      cy.contains('Personal Info').parent().find('div').first()
        .should('have.class', 'bg-primary');

      // Avanzar al paso 2
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      // Paso 1 completado (con checkmark), paso 2 activo
      cy.contains('Contact').parent().find('div').first()
        .should('have.class', 'bg-primary');

      // Avanzar al paso 3
      cy.fillRegistrationStep2({
        email: 'john.doe@test.com',
      });
      cy.contains('button', 'Next').click();

      // Paso 3 activo
      cy.contains('Security').parent().find('div').first()
        .should('have.class', 'bg-primary');
    });

    it('debe actualizar la barra de progreso', () => {
      // Verificar que la barra existe
      cy.get('.bg-muted.rounded-full').should('exist');

      // La barra debe crecer al avanzar
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      // Verificar que la barra de progreso cambió
      cy.get('.bg-primary.transition-all').should('exist');
    });
  });

  describe('Funcionalidad de mostrar/ocultar contraseña', () => {
    beforeEach(() => {
      // Navegar al paso 3
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'john.doe@test.com',
      });
      cy.contains('button', 'Next').click();
    });

    it('debe mostrar/ocultar la contraseña al hacer clic en el icono', () => {
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      
      // Hacer clic en el botón de mostrar contraseña
      cy.get('input[name="password"]').parent().find('button').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'text');

      // Hacer clic nuevamente para ocultar
      cy.get('input[name="password"]').parent().find('button').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });
  });

  describe('Integración con backend (mocked)', () => {
    it('debe mostrar alert de error cuando el email ya está registrado', () => {
      // Interceptar la llamada al backend
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'Email already registered',
        },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'existing@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      // Esperar la respuesta
      cy.wait('@registerRequest');

      // Verificar que muestra el alert de error
      cy.contains('Registration failed').should('be.visible');
      cy.contains('Email already registered').should('be.visible');

      // Verificar que redirige al paso 2 (donde está el email)
      cy.get('input[name="email"]').should('be.visible');
    });

    it('debe mostrar alert de error cuando el ID ya está registrado', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'ID number already registered',
        },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '999999999',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'john@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que muestra el alert de error
      cy.contains('Registration failed').should('be.visible');
      cy.contains('ID number already registered').should('be.visible');

      // Verificar que redirige al paso 1 (donde está el ID)
      cy.get('input[name="idNumber"]').should('be.visible');
    });

    it('debe redirigir al paso 2 y permitir corregir el email cuando está duplicado', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'Email already registered',
        },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'duplicate@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que muestra el alert de error
      cy.contains('Registration failed').should('be.visible');
      cy.contains('Email already registered').should('be.visible');

      // Verificar que redirige al paso 2 (Contact)
      cy.contains('Contact').parent().find('div').first()
        .should('have.class', 'bg-primary'); // Paso 2 activo
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="phoneNumber"]').should('be.visible');

      // Verificar que el email anterior se mantiene
      cy.get('input[name="email"]').should('have.value', 'duplicate@test.com');

      // Verificar que el usuario puede corregir el email
      cy.get('input[name="email"]').clear().type('newemail@test.com');
      cy.get('input[name="email"]').should('have.value', 'newemail@test.com');

      // Verificar que puede avanzar nuevamente
      cy.contains('button', 'Next').should('not.be.disabled');
    });

    it('debe redirigir al paso 1 y permitir corregir el ID cuando está duplicado', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'ID number already registered',
        },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '999999999',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'john@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que muestra el alert de error
      cy.contains('Registration failed').should('be.visible');
      cy.contains('ID number already registered').should('be.visible');

      // Verificar que redirige al paso 1 (Personal Info)
      cy.contains('Personal Info').parent().find('div').first()
        .should('have.class', 'bg-primary'); // Paso 1 activo
      cy.get('input[name="idNumber"]').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');

      // Verificar que el ID anterior se mantiene
      cy.get('input[name="idNumber"]').should('have.value', '999999999');

      // Verificar que el usuario puede corregir el ID
      cy.get('input[name="idNumber"]').clear().type('111111111');
      cy.get('input[name="idNumber"]').should('have.value', '111111111');

      // Verificar que puede avanzar nuevamente
      cy.contains('button', 'Next').should('not.be.disabled');
    });

    it('debe mantener todos los datos al redirigir por error de email', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'Email already registered',
        },
      }).as('registerRequest');

      // Llenar formulario completo con datos específicos
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'duplicate@test.com',
        phoneNumber: '+1234567890',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que está en el paso 2
      cy.get('input[name="email"]').should('be.visible');

      // Verificar que todos los datos del paso 2 se mantienen
      cy.get('input[name="email"]').should('have.value', 'duplicate@test.com');
      cy.get('input[name="phoneNumber"]').should('have.value', '+1234567890');

      // Navegar al paso 1 y verificar que los datos se mantienen
      cy.contains('button', 'Back').click();
      cy.get('input[name="idNumber"]').should('have.value', '123456789');
      cy.get('input[name="name"]').should('have.value', 'John');
      cy.get('input[name="lastName"]').should('have.value', 'Doe');

      // Navegar al paso 3 y verificar que los datos se mantienen
      cy.contains('button', 'Next').click(); // Volver al paso 2
      cy.contains('button', 'Next').click(); // Ir al paso 3
      cy.get('input[name="password"]').should('have.value', 'Test123!@#');
      cy.get('input[name="confirmPassword"]').should('have.value', 'Test123!@#');
      cy.contains('I agree to the').scrollIntoView();
      cy.get('input[type="checkbox"]').should('be.checked');
    });

    it('debe mantener todos los datos al redirigir por error de ID', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'ID number already registered',
        },
      }).as('registerRequest');

      // Llenar formulario completo con datos específicos
      cy.fillRegistrationStep1({
        idNumber: '999999999',
        name: 'Jane',
        lastName: 'Smith',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'jane@test.com',
        phoneNumber: '+9876543210',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Secure456!@#',
        confirmPassword: 'Secure456!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que está en el paso 1
      cy.get('input[name="idNumber"]').should('be.visible');

      // Verificar que todos los datos del paso 1 se mantienen
      cy.get('input[name="idNumber"]').should('have.value', '999999999');
      cy.get('input[name="name"]').should('have.value', 'Jane');
      cy.get('input[name="lastName"]').should('have.value', 'Smith');

      // Navegar al paso 2 y verificar que los datos se mantienen
      cy.contains('button', 'Next').click();
      cy.get('input[name="email"]').should('have.value', 'jane@test.com');
      cy.get('input[name="phoneNumber"]').should('have.value', '+9876543210');

      // Navegar al paso 3 y verificar que los datos se mantienen
      cy.contains('button', 'Next').click();
      cy.get('input[name="password"]').should('have.value', 'Secure456!@#');
      cy.get('input[name="confirmPassword"]').should('have.value', 'Secure456!@#');
      cy.contains('I agree to the').scrollIntoView();
      cy.get('input[type="checkbox"]').should('be.checked');
    });

    it('no debe redirigir si el error no es de email o ID duplicado', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 500,
        body: {
          message: 'Internal server error',
        },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'john@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que muestra el alert de error
      cy.contains('Registration failed').should('be.visible');
      cy.contains('Internal server error').should('be.visible');

      // Verificar que permanece en el paso 3 (Security)
      cy.contains('Security').parent().find('div').first()
        .should('have.class', 'bg-primary'); // Paso 3 activo
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
    });

    it('debe ocultar el alert de error después de 5 segundos', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 400,
        body: {
          message: 'Email already registered',
        },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'duplicate@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que el alert está visible
      cy.contains('Registration failed').should('be.visible');

      // Esperar 5 segundos y verificar que el alert desaparece
      cy.wait(5000);
      cy.contains('Registration failed').should('not.exist');
    });

    it('debe mostrar alert de éxito cuando el registro es exitoso', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 200,
        body: {
          message: 'Please check your email to activate your account.',
        },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'newuser@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      cy.wait('@registerRequest');

      // Verificar que muestra el alert de éxito
      cy.contains('Account created successfully!').should('be.visible');
      cy.contains('Please check your email to activate your account').should('be.visible');
    });
  });

  describe('Accesibilidad y UX', () => {
    it('debe tener labels asociados a los inputs', () => {
      cy.get('input[name="idNumber"]').should('have.attr', 'id');
      cy.get('label').contains('ID Number').should('exist');
    });

    it('debe deshabilitar botones durante el envío', () => {
      cy.intercept('POST', '**/api/auth/register', {
        delay: 1000,
        statusCode: 200,
        body: { message: 'Success' },
      }).as('registerRequest');

      // Llenar formulario completo
      cy.fillRegistrationStep1({
        idNumber: '123456789',
        name: 'John',
        lastName: 'Doe',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep2({
        email: 'test@test.com',
      });
      cy.contains('button', 'Next').click();

      cy.fillRegistrationStep3({
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      });
      cy.contains('button', 'Create Account').click();

      // Verificar que el botón está deshabilitado
      cy.contains('button', 'Creating account...').should('be.disabled');
    });

    it('debe mostrar el calendario para fecha de nacimiento', () => {
      cy.contains('Pick a date').click();
      
      // Verificar que se abre el popover con el calendario
      cy.get('[role="dialog"]').should('be.visible');
    });
  });
});

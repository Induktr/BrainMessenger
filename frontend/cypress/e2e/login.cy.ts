describe('Login Flow', () => {
  it('should allow a user to log in successfully', () => {
    // Посетить страницу логина
    cy.visit('/login');

    // Ввести email и пароль (используйте тестовые учетные данные)
    // Замените 'input[name="email"]' и 'input[name="password"]' на актуальные селекторы ваших полей ввода
    cy.get('input[name="email"]').type('nikitavoitenko2020@gmail.com'); // Используйте тестовый email
    cy.get('input[name="password"]').type('AFF44667Ass$!!'); // Используйте тестовый пароль

    // Нажать кнопку логина
    // Замените 'button' и 'Login' на актуальный селектор вашей кнопки логина и текст
    cy.get('button').contains('Login').click(); // Пример: ищем кнопку с текстом "Login" и нажимаем

    // Проверить, что пользователь перенаправлен на страницу чата (или другую защищенную страницу)
    // Замените '/chat' на актуальный путь
    cy.url().should('include', '/chat');

    // Дополнительные проверки после логина, например, наличие элементов, видимых только авторизованным пользователям
    // cy.contains('Welcome, Induktr').should('be.visible'); // Пример проверки текста приветствия
    // cy.get('[data-cy=user-avatar]').should('be.visible'); // Пример проверки аватара пользователя
  });
});

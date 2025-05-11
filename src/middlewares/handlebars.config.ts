import * as Handlebars from 'handlebars';

export function registerHelpers() {
  Handlebars.registerHelper('month', (date: Date) => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return months[date.getMonth()];
  });

  Handlebars.registerHelper('day', (date: Date) => {
    return date.getDate();
  });
}

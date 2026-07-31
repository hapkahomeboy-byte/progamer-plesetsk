// ===== Progamer: безопасный прокси для заявок в Telegram =====
// Этот код выполняется НЕ в браузере посетителя, а на сервере Cloudflare —
// поэтому токен бота здесь в безопасности, никто из посетителей сайта его не увидит.
//
// КАК ПОДКЛЮЧИТЬ (один раз, займёт 5-10 минут):
// 1. Зайдите на https://workers.cloudflare.com и зарегистрируйтесь (бесплатно).
// 2. Create Application → Create Worker → дайте любое имя, например "progamer-booking".
// 3. Откройте редактор Worker'а, удалите весь код-заглушку, вставьте вместо него код ниже.
// 4. Settings → Variables → Add variable (Environment Variables):
//      BOT_TOKEN = 8994212475:AAFONvZnQyZrMkw2ZZ-beg2rJovC7wJqSmA   (тип: Secret / зашифровано)
//      CHAT_ID   = 8748250402
//    ВАЖНО: раз этот токен уже был в открытом доступе на GitHub, лучше сгенерировать
//    НОВЫЙ токен через @BotFather → /mybots → выберите бота → Bot Settings → Revoke current token,
//    и использовать уже новый токен здесь.
// 5. Save and Deploy. Скопируйте адрес вида: https://progamer-booking.ВАШ-НИК.workers.dev
// 6. В index.html, в константе BOOKING_ENDPOINT, вставьте этот адрес + "/send" на конце.

export default {
  async fetch(request, env) {
    // CORS — разрешаем запросы только с вашего сайта
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://hapkahomeboy-byte.github.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { name, phone, type, date, comment } = await request.json();

      if (!name || !phone) {
        return new Response(JSON.stringify({ ok: false, error: 'name and phone required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const typeLabels = { pc: 'Игровой ПК', ps5: 'PlayStation 5', sim: 'Автосимулятор' };
      const message =
        `📦 <b>Новая заявка на бронь!</b>\n\n` +
        `👤 Имя: ${escapeHtml(name)}\n` +
        `📞 Телефон: ${escapeHtml(phone)}\n` +
        `🖥 Тип: ${escapeHtml(typeLabels[type] || type || 'Не указано')}\n` +
        `📅 Дата/Время: ${escapeHtml(date || 'Не указано')}\n` +
        `📝 Комментарий: ${escapeHtml(comment || 'Нет')}`;

      const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
      const tgResponse = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.CHAT_ID, text: message, parse_mode: 'HTML' }),
      });

      if (!tgResponse.ok) {
        return new Response(JSON.stringify({ ok: false, error: 'telegram send failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: 'bad request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

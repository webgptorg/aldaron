# Nastavení platební brány pro členství v komunitě

Členství se nově kupuje přímo v `/cs/komunita`. Připojený člen vidí v místnosti sekci **Placené členství komunity**,
zadá jen slevový kód a potvrdí podmínky – jméno ani e-mail už se ho neptáme, protože je místnost zná. Platba pak
proběhne na zabezpečené stránce Stripe a člen se vrátí zpět do místnosti. Na `/cs/komunita/clenstvi` se nesahalo, ta
zůstává veřejnou landing page.

**Dokud nenastavíte klíče níže, aplikace o placeném členství v místnosti nic neříká** – nikde se neobjeví tlačítko,
které by nemohlo fungovat. Nic se tedy nerozbije, jen se členství nebude dát koupit.

## 1. Databáze

Přibyla migrace `migrations/2026-08-3400-community-membership-payments.sql`. Server ji použije sám při startu, ručně:

```bash
npm run migrate-database
```

## 2. Klíče do `.env`

```bash
# Stripe – tajný klíč účtu. `sk_test_…` = testovací brána, `sk_live_…` = ostrá.
STRIPE_SECRET_KEY=sk_test_...

# Stripe – podpis webhooku (viz krok 3). Bez něj platby fungují, jen se o zrušení dozvíme později.
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
```

Tajný klíč najdete v Stripe Dashboardu v **Developers → API keys**:

- testovací: <https://dashboard.stripe.com/test/apikeys>
- ostrý: <https://dashboard.stripe.com/apikeys>

Přepínač **Test mode** vpravo nahoře rozhoduje, který klíč vidíte. Nic dalšího ve Stripe zakládat nemusíte – žádné
produkty ani ceny. Cenu členství (dnes 199 Kč / měsíc) i slevové kódy určuje aplikace a posílá je do Stripe s každou
platbou, takže se cena mění v `businesses/community/membership/communityMembershipConfig.ts`, ne v Stripe.

## 3. Webhook

Webhook není nutný k tomu, aby platba prošla (návrat z brány si aplikace ověří sama), ale je potřeba, aby se komunita
dozvěděla o zrušení členství, neúspěšné platbě nebo o platbě dokončené později.

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Adresa: `https://ptbk.io/api/stripe/webhook`
3. Události:
    - `checkout.session.completed`
    - `checkout.session.async_payment_succeeded`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
4. Zkopírujte **Signing secret** (`whsec_…`) do `STRIPE_WEBHOOK_SIGNING_SECRET`.

Webhook s neplatným podpisem se odmítne, takže na tuto adresu nikdo cizí nic nezapíše.

## 4. Testování testovací kartou

1. Do `.env` dejte testovací klíč (`sk_test_…`) a spusťte `npm run dev`.
2. Otevřete `http://localhost:4009/cs/komunita` a připojte se jménem a e-mailem.
3. V sekci členství uvidíte žlutou poznámku, že jde o testovací režim – tu na ostrých klíčích aplikace nikdy neukáže.
4. Zaplaťte kartou:
    - **úspěch:** `4242 4242 4242 4242`
    - **potvrzení v bance (3D Secure):** `4000 0025 0000 3155`
    - **zamítnutá karta:** `4000 0000 0000 9995`
    - datum expirace cokoliv v budoucnosti, CVC cokoliv, PSČ cokoliv
5. Po zaplacení se vrátíte do místnosti, kde se objeví „Platba proběhla“ a badge v hlavičce se změní na
   **Placené členství**.

Webhooky na localhost přepošlete Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:4009/api/stripe/webhook
```

CLI vypíše vlastní `whsec_…` – ten patří do `STRIPE_WEBHOOK_SIGNING_SECRET` po dobu lokálního testování.

Testovací platby vidíte na <https://dashboard.stripe.com/test/payments>, testovací předplatná na
<https://dashboard.stripe.com/test/subscriptions>.

## 5. Přechod na ostrý provoz

Vyměňte `STRIPE_SECRET_KEY` za `sk_live_…` a `STRIPE_WEBHOOK_SIGNING_SECRET` za podpis ostrého webhooku. Poznámka
o testovacím režimu z místnosti zmizí sama. Testovací a ostrá data se v databázi nepletou – u každého členství je
uloženo, na které bráně vzniklo.

## 6. Co je dobré vědět

- **Zrušení členství** se dnes dělá ve Stripe (Subscriptions → Cancel). Webhook to zapíše zpět a člen v místnosti
  přestane být placeným členem. V textu místnosti proto zůstává „Zrušit můžete kdykoli e-mailem“.
- **Neúspěšná platba** členství hned nebere – místnost napíše, že poslední platba neprošla, a přístup drží, dokud to
  Stripe nevzdá.
- **Slevový kód** se odečítá z opakované měsíční ceny, takže sleva členovi zůstává, dokud členství trvá. Kód se
  spotřebuje až po zaplacení, ne při otevření brány. Pozor na velmi vysoké slevy: minimální částka, kterou umí Stripe
  v CZK strhnout, je 15 Kč.
- **Měna** je CZK. Účet Stripe ji musí mít povolenou (české účty ji mají).

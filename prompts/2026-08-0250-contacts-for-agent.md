[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.5386 18 minutes; Testing a minute

---

[ ]

[✨🕛] Add option to download all the contacts shaped as context for AI agent

- This is relevant for all places in admin contacts are exported - `/admin/contacts`, `/admin/workshops`, komunita,...
- This is added alongside the existing options to download contacts as CSV or VCard.
- You are always downloading only the filtered contacts, same as downloading contacts to CSV or VCard.
- The downloaded file type should be `.book`
- To do every contact, you should put all information you have across the system you have for this contact.
- Add information about the workshop attendance, number of reactions, comments, how long he was there. This should be full context about that person we have.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

Exported contacts should look like:

```book
Contacts 2026-08-25

NOTE Thees are the contacts exported from ...


CONTACT John Snow
....

CONTACT Jane Doe
...


```

@@@@@@@@@@@@@@

```
CONTACT Daniel Král

Normalized email: phreo.jd@gmail.com

Contact records:
Contact #1399
Created at: 2026-08-22T15:01:38.656387+00:00
Full name: Daniel Král
Email: phreo.jd@gmail.com
Phone: 722907474
User note: Online workshop registration
Workshop: Produkční kód s AI agenty
Workshop URL slug: online-workshop-2026-08-26
Date: středa 26. 8. 2026 17:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0
IP address: 150.228.35.239
Referrer:
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=registrace-online-workshop&utm_medium=email#registrace

Contact #607
Created at: 2026-08-09T09:37:45.205648+00:00
Full name: Daniel Král
Email: phreo.jd@gmail.com
Phone: 735027049
User note: Online workshop registration
Date: čtvrtek 20. 8. 2026 19:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Linux; Android 14; 22101316G Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.102 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/573.0.0.37.74;IABMV/1;]
IP address: 37.188.163.81
Referrer: http://m.facebook.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=fb&utm_medium=paid_social&utm_campaign=ptbk-webinar-2008&utm_content=2&utm_term=7.8+%7C+Webin%C3%A1%C5%99+20.8+%7C+1000+K%C4%8D&fbclid=IwcGRvZgVleHRuA2FlbQEwAGFkaWQBqzv8sVobjHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHjmvvyaW_PLAVutBwxsAXZobyapbQn-9wsHcMJT4ljpDQQXuGa-ZUpByyoih_aem_zsjCyXoMtdrxAfynDasElw&utm_id=120255722350920012#registrace

Workshop attendance:
Workshop: Produkční kód s AI agenty
Workshop ID: 56479f54-d15a-49e6-9b5c-77d93137c422
Workshop starts at: 2026-08-26T15:00:00+00:00
Workshop ends at: 2026-08-26T16:00:00+00:00
Participant ID: 3e3235f2-2b0d-40de-8615-5bbe4213bf04
Participant full name: Daniel Král
Participant email: phreo.jd@gmail.com
Joined at: 2026-08-22T14:57:57.802953+00:00
Last seen at: 2026-08-22T15:06:27.413+00:00
Active duration seconds: 40
Comments: 0
Reactions: 0
Material link clicks: 0
Comment upvotes: 0
Trusted: no
Interaction banned: no


CONTACT Pavel javorek

Normalized email: xhanibal@seznam.cz

Contact records:
Contact #1398
Created at: 2026-08-22T13:34:57.262566+00:00
Full name: Pavel javorek
Email: xhanibal@seznam.cz
Phone:
User note: Online workshop registration
Workshop: Produkční kód s AI agenty
Workshop URL slug: online-workshop-2026-08-26
Date: středa 26. 8. 2026 17:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Linux; Android 16; SM-S911B Build/BP4A.251205.006) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.165 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/575.0.0.45.73;IABMV/1;]
IP address: 185.230.172.89
Referrer: http://m.facebook.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=fb&utm_medium=paid_social&utm_campaign=ptbk-webinar-2008&utm_content=1&utm_term=7.8+%7C+Webin%C3%A1%C5%99+20.8+%7C+1000+K%C4%8D&fbclid=IwcGRvZgVleHRuA2FlbQEwAGFkaWQBqzxRAPRUTHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHpfgZbtC1T-6vcHWybA7m9-dfTCX6qfzbMMFeEMSiG8q52DRFJhzo_ad1A7m_aem__8-JgpqRXVAOz7paPG7_TQ&utm_id=120255722350920012#registrace

Contact #1007
Created at: 2026-08-14T15:55:49.202067+00:00
Full name: Pavel Javorek
Email: xhanibal@seznam.cz
Phone:
User note: Online workshop registration
Date: čtvrtek 20. 8. 2026 19:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Linux; Android 16; SM-S911B Build/BP4A.251205.006) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.102 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/573.0.0.37.74;IABMV/1;]
IP address: 185.230.172.89
Referrer: http://m.facebook.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=fb&utm_medium=paid_social&utm_campaign=ptbk-webinar-2008&utm_content=2&utm_term=7.8+%7C+Webin%C3%A1%C5%99+20.8+%7C+1000+K%C4%8D&fbclid=IwcGRvZgVleHRuA2FlbQEwAGFkaWQBqzv8sVobjHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHiwFHSnqWE9MHs9KiiFVknzmxHavI20w2V_FE8HsAp72lj9KF0NMt8mpLuNm_aem_YeTdjww61gqTFWIn05Y5og&utm_id=120255722350920012#registrace

Workshop attendance:
Workshop: Produkční kód s AI agenty
Workshop ID: 5a7eb2ad-2583-4e98-9640-50bc773b5fde
Workshop starts at: 2026-08-20T17:00:00+00:00
Workshop ends at: 2026-08-20T19:30:00+00:00
Participant ID: 31bcdb18-aadf-42bf-bf9b-283674f76f80
Participant full name: Pavel Javorek
Participant email: xhanibal@seznam.cz
Joined at: 2026-08-21T06:39:08.130824+00:00
Last seen at: 2026-08-21T13:20:08.213591+00:00
Active duration seconds: 47
Comments: 0
Reactions: 0
Material link clicks: 0
Comment upvotes: 0
Trusted: no
Interaction banned: no

Workshop: Produkční kód s AI agenty
Workshop ID: 5a7eb2ad-2583-4e98-9640-50bc773b5fde
Workshop starts at: 2026-08-20T17:00:00+00:00
Workshop ends at: 2026-08-20T19:30:00+00:00
Participant ID: c722dbbf-8b7a-4ba1-9bbd-45710330d9f5
Participant full name: Pavel Javorek
Participant email: xhanibal@seznam.cz
Joined at: 2026-08-21T04:17:00.03228+00:00
Last seen at: 2026-08-21T04:21:51.656672+00:00
Active duration seconds: 214
Comments: 0
Reactions: 0
Material link clicks: 1
Comment upvotes: 0
Trusted: no
Interaction banned: no


CONTACT footer-test@ptbk.io

Normalized email: footer-test@ptbk.io

Contact records:
Contact #1397
Created at: 2026-08-22T13:08:30.30174+00:00
Full name:
Email: footer-test@ptbk.io
Phone:
User note:
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
IP address: 78.80.116.141
Referrer:
App name: Landing page
Place name: newsletter-footer
URL: https://www.ptbk.io/ai-supervize-mini?code=webinar-2026-08-20d#registrace

Workshop attendance:
No information recorded.


CONTACT Julie Karlik

Normalized email: julie.karlik@webtoad.dev

Contact records:
Contact #1396
Created at: 2026-08-22T12:21:35.645406+00:00
Full name: Julie Karlik
Email: julie.karlik@webtoad.dev
Phone:
User note: AI Supervize Mini interest without current attendance
Reason count: 2
Reasons: Datum mi nevyhovuje, Mám zájem o jiný formát (např. online)
Original registration CTA opened from current workshop section: yes

{
    "workshop": "AI Supervize Mini",
    "leadType": "Interested, but cannot attend current workshop",
    "reasons": [
        "Datum mi nevyhovuje",
        "Mám zájem o jiný formát (např. online)"
    ],
    "fullname": "Julie Karlik",
    "email": "julie.karlik@webtoad.dev",
    "company": "WebToad",
    "userNote": "Online, mimo prac.dobu"
}
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
IP address: 149.102.235.136
Referrer:
App name: Landing page
Place name: AiSupervizeMiniWorkshopInterest
URL: https://www.ptbk.io/ai-supervize-mini?code=webinar-2026-08-20&utm_source=promptbook&utm_medium=workshop&utm_campaign=online-workshop-2026-08-20&utm_content=97750144-2b5c-436f-8e2b-86aa904aae95#registrace

Contact #1323
Created at: 2026-08-20T07:31:34.984382+00:00
Full name: Julie Karlik
Email: julie.karlik@webtoad.dev
Phone:
User note: Online workshop registration
Date: čtvrtek 20. 8. 2026 19:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
IP address: 152.233.16.10
Referrer: https://www.linkedin.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop#registrace

Workshop attendance:
Workshop: Produkční kód s AI agenty
Workshop ID: 5a7eb2ad-2583-4e98-9640-50bc773b5fde
Workshop starts at: 2026-08-20T17:00:00+00:00
Workshop ends at: 2026-08-20T19:30:00+00:00
Participant ID: 7c16192a-7859-4b7a-833a-edd0195a61cd
Participant full name: Julie Karlik
Participant email: julie.karlik@webtoad.dev
Joined at: 2026-08-20T18:08:55.398959+00:00
Last seen at: 2026-08-21T04:44:50.378603+00:00
Active duration seconds: 69
Comments: 0
Reactions: 0
Material link clicks: 3
Comment upvotes: 0
Trusted: no
Interaction banned: no


CONTACT MILAN ŠTAJER

Normalized email: stajo@post.sk

Contact records:
Contact #1395
Created at: 2026-08-22T11:46:52.512823+00:00
Full name: MILAN ŠTAJER
Email: stajo@post.sk
Phone: +421908768041
User note: Online workshop registration
Workshop: Produkční kód s AI agenty
Workshop URL slug: online-workshop-2026-08-26
Date: středa 26. 8. 2026 17:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
IP address: 31.30.160.191
Referrer: https://l.facebook.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=fb&utm_medium=paid_social&utm_campaign=ptbk-webinar-2008&utm_content=1&utm_term=7.8+%7C+Webin%C3%A1%C5%99+20.8+%7C+1000+K%C4%8D&utm_id=120255722350920012&fbclid=IwY2xjawT2a3FwZG9mAWV4dG4DYWVtATAAYWRpZAGrPFEA9FRMc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHk0eCOlZP4juig_86bjLViid4Lqjha6pWAuP8PwoWoKWNOGeuU4ZWlkfT4pn_aem_YvCL9dvCNQ8N7PsNkiQxcw#registrace

Contact #1224
Created at: 2026-08-18T23:33:44.966147+00:00
Full name: MILAN ŠTAJER
Email: stajo@post.sk
Phone: +421908768041
User note: Online workshop registration
Date: čtvrtek 20. 8. 2026 19:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
IP address: 31.30.160.10
Referrer: https://l.facebook.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=fb&utm_medium=paid_social&utm_campaign=ptbk-webinar-2008&utm_content=4&utm_term=7.8+%7C+Webin%C3%A1%C5%99+20.8+%7C+1000+K%C4%8D&utm_id=120255722350920012&fbclid=IwY2xjawTxywNwZG9mAWV4dG4DYWVtATAAYWRpZAGrO_yxqLC8c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHjNOy0hJnvIqnwGneplmgImIyXigtr7xLAFtnzCLx2F_9mnvLWHyIBVDhF7o_aem_Gq1Zp3g1QheOcEqJqviYEA#registrace

Workshop attendance:
No information recorded.


CONTACT Tomáš Říha

Normalized email: triha.pkr@gmail.com

Contact records:
Contact #1394
Created at: 2026-08-22T11:01:02.444952+00:00
Full name: Tomáš Říha
Email: triha.pkr@gmail.com
Phone: +420728399636
User note: Online workshop registration
Workshop: Produkční kód s AI agenty
Workshop URL slug: online-workshop-2026-08-26
Date: středa 26. 8. 2026 17:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (iPhone; CPU iPhone OS 26_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23G71 Instagram 438.0.0.18.73 (iPhone17,3; iOS 26_6; en_US; en; scale=3.00; 1179x2556; IABMV/1; 1015949731) Safari/604.1
IP address: 89.190.90.248
Referrer: https://instagram.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=ig&utm_medium=paid_social&utm_campaign=ptbk-webinar-2008&utm_content=4&utm_term=7.8+%7C+Webin%C3%A1%C5%99+20.8+%7C+1000+K%C4%8D&utm_id=120255722350920012&fbclid=PAcGRvZgJmZGlkFlDPCP9Bg5KX8_ulsEpHPzuLbmMLWEBleHRuA2FlbQEwAGFkaWQBqzxRAMDBLHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABp19WCiWA4aW48W3p3WQxwAtUMnTcRL9sEcnz66-qRNKd4AqlXeBqrlzhCnMw_aem_-5SHg0PmEgqhUGTCwIWAzg#registrace

Workshop attendance:
No information recorded.


CONTACT Zdeněk Novotný

Normalized email: zdenek.novotny.15@seznam.cz

Contact records:
Contact #1393
Created at: 2026-08-22T10:19:41.650243+00:00
Full name: Zdeněk Novotný
Email: zdenek.novotny.15@seznam.cz
Phone:
User note: Online workshop registration
Workshop: Produkční kód s AI agenty
Workshop URL slug: online-workshop-2026-08-26
Date: středa 26. 8. 2026 17:00
Is contacted: no
Our note:
User agent: Mozilla/5.0 (Linux; Android 14; 22101316G Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.162 Mobile Safari/537.36 Instagram 443.0.0.48.82 Android (34/14; 440dpi; 1080x2400; Xiaomi/Redmi; 22101316G; ruby; mt6877; cs_CZ; 1043215257; IABMV/1)
IP address: 109.80.1.15
Referrer: https://instagram.com/
App name: Landing page
Place name: OnlineWorkshopRegistration
URL: https://www.ptbk.io/cs/online-workshop?utm_source=ig&utm_medium=paid_social&utm_campaign=ptbk-webinar-2008&utm_content=1&utm_term=7.8+%7C+Webin%C3%A1%C5%99+20.8+%7C+1000+K%C4%8D&utm_id=120255722350920012&fbclid=PAcGRvZgJleHRuA2FlbQEwAGFkaWQBqzxRAPRUTHNydGMGYXBwX2lkDzU2NzA2NzM0MzM1MjQyNwABp3_kOEZL4-Na4g-yzSvCAqENzItC2ZM6q0F7mCRp2UjUI85Z-PkzjETYhB6H_aem_OyHmWasRD1I-y-jp6YwjrQ

Workshop attendance:
No information recorded.
```

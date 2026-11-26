# Lead destinations

Every form posts to its endpoint in `src/pages/api/`; `src/features/leads/integrations/configured-lead-gateway.ts`
sends the validated lead to Attio and Brevo and confirms the submission only after both accept it. While any
variable below is missing, the forms answer `503` and show their "unavailable" message.

| Variable                   | Purpose                                                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ATTIO_API_TOKEN`          | Token of the "Korum" Attio workspace with `record_permission`, `object_configuration`, `list_entry` and `list_configuration` read-write |
| `ATTIO_DEAL_OWNER_EMAIL`   | Attio workspace member who owns new deals (must have accepted the invite)                                                               |
| `BREVO_API_TOKEN`          | Brevo API key; the account must not restrict API calls by IP, because Vercel Functions have no fixed address                            |
| `BREVO_NEWSLETTER_LIST_ID` | List "[site] - korum - newsletter a pauta" in the Brevo folder "Korum"                                                                  |

## Attio (CRM)

| Form                      | Result                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `visit-request`           | Company found or created by name + person + deal "Visit · {company}" in stage "New lead" |
| `newsletter-subscription` | Person + entry in the "Newsletter" list                                                  |

- People are matched by e-mail; the visit form makes e-mail optional, so a person without one is matched by WhatsApp.
- A person keeps one open deal: a later visit request updates its name, source, company, product, period and message,
  and leaves stage, owner and value as the team set them.
- The deal `product` comes from the visitor's interest ("Ainda não sei" leaves it empty) and sets the list price:
  Episódio Piloto R$ 590, Dia Korum R$ 3.900, Plano Autoridade R$ 4.900 per month; Design de marca has no price.

Workspace configuration the adapter relies on: People `lead_source` select ("Visit request (site)", "Newsletter");
Deals `product` select (one option and one filtered Kanban view per product, as Attio recommends for pipelines that
share stages), `lead_source` select, `preferred_period` select ("Morning", "Afternoon") and `message` text; deal stages
"New lead", "Visit scheduled", "Won 🎉" and "Lost"; the People list `newsletter`. Set the deal Value currency to BRL
in Attio's settings (the API cannot change it).

## Brevo (e-mail)

Newsletter sign-ups join the list (`updateEnabled` keeps one contact per e-mail); "A Pauta" is sent from Brevo.

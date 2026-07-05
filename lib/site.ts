// Central place for store payment details shown at checkout.
// 👉 EDIT these with your real bank / wallet details.
export const PAYMENT_INSTRUCTIONS = {
  title: 'How to pay & place your order',
  intro:
    'We accept advance payment only. Pay the exact order total using one of the methods below, take a screenshot of the successful payment, then attach it in the form and place your order.',
  methods: [
    { label: 'Bank Transfer', detail: 'Bank: XYZ Bank · Title: ShopHub · Account #: 0000-0000-0000-0000' },
    { label: 'Easypaisa', detail: '03XX-XXXXXXX (ShopHub)' },
    { label: 'JazzCash', detail: '03XX-XXXXXXX (ShopHub)' },
  ],
  steps: [
    'Send the EXACT order total to one of the accounts above.',
    'Take a clear screenshot of the successful payment / receipt.',
    'Fill in your shipping details in the form.',
    'Attach the payment screenshot (required).',
    'Press "Place Order". You will get a confirmation email right away.',
    'We verify your payment and then confirm & ship your order.',
  ],
}

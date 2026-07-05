content = open('app/api/stripe/payment-intent/route.js', encoding='utf-8').read()

content = content.replace(
    '''    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: { plan, email, name },
      receipt_email: email,
    });''',
    '''    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { plan, email, name },
      receipt_email: email,
    });'''
)

open('app/api/stripe/payment-intent/route.js', 'w', encoding='utf-8').write(content)
print("Done!")
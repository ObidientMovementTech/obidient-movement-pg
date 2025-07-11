export function generateReferralCode(email=""){
    const name = `${email}`.slice(0, 5).toUpperCase();
    const digits = generateRandomDigits()
    const referral_id = `${name}-${digits}`
    return referral_id
}

function generateRandomDigits() {
    let digits = '';
    for (let i = 0; i < 12; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    return digits;
  }
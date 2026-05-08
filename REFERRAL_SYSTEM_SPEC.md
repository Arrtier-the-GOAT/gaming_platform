# Referral Reward System Specification

## Overview
The Gaming Platform implements a referral system where users can invite others using their unique alphanumeric referral code. When a referred user (referee) purchases premium membership, the referrer receives a fixed commission.

---

## Referral Code Generation

### Code Format
- **Type:** Alphanumeric (A-Z, a-z, 0-9)
- **Length:** 8-12 characters
- **Uniqueness:** One unique code per user
- **Generation:** Automatically generated when user creates account
- **Immutability:** Cannot be changed by user

### Code Assignment
- Each user receives exactly one referral code upon account creation
- Codes are stored in the `users.referralCode` field
- Codes must be globally unique across all users

---

## Referral Reward Mechanism

### Trigger Condition
When a referee (user who was invited) purchases premium membership for a minimum duration of 1 month, the referrer receives a fixed commission.

### Commission Structure

| Party | Reward Type | Amount | Trigger |
|-------|------------|--------|---------|
| **Referrer** | Fixed Commission | 3,000 MMK | Referee purchases ≥1 month premium |
| **Referee** | None | - | - |

### Commission Details
- **Amount:** 3,000 MMK (fixed, non-negotiable)
- **Currency:** Myanmar Kyat (MMK)
- **Frequency:** Per premium purchase by referee
- **Minimum Premium Duration:** 1 month
- **Payment Method:** Direct credit to referrer's account balance (mykBalance)

---

## Referral Tracking

### Data Structure
- **Referrer ID:** User who created the referral code
- **Referee ID:** User who used the referral code during signup
- **Referral Code:** The code used during signup
- **Commission Status:** Pending / Awarded
- **Commission Amount:** 3,000 MMK
- **Commission Awarded Date:** Timestamp when commission was credited

### Referral Table Fields
```
referrals {
  id: int (primary key)
  referrerId: int (foreign key to users)
  refereeId: int (foreign key to users)
  referralCode: varchar (the code used)
  bonusAwarded: boolean (commission paid status)
  bonusAwardedAt: timestamp (when commission was paid)
  createdAt: timestamp (when referral was created)
}
```

---

## Commission Payment Flow

### Step 1: Referee Registration
- New user signs up using referrer's referral code
- System creates referral record with `bonusAwarded = false`

### Step 2: Referee Premium Purchase
- Referee purchases premium membership for ≥1 month
- System detects valid referral relationship

### Step 3: Commission Award
- System credits 3,000 MMK to referrer's `mykBalance`
- Update referral record: `bonusAwarded = true`, `bonusAwardedAt = current_timestamp`
- Create transaction record in `energyCoreTransactions` table

### Step 4: Referrer Notification
- Send notification to referrer about earned commission
- Display commission in referral dashboard

---

## Constraints & Rules

1. **One Code Per User:** Each user has exactly one unique referral code
2. **Self-Referral Prevention:** Users cannot use their own referral code
3. **Single Use Per Signup:** Each user can only use one referral code during signup
4. **Commission Once Per Purchase:** Commission awarded for each separate premium purchase
5. **Minimum Duration:** Premium must be for minimum 1 month to trigger commission
6. **No Refund Clawback:** If referee cancels premium, commission is not reversed

---

## User Interface Requirements

### Referral Page
- Display user's unique referral code
- Copy-to-clipboard button for referral code
- Generate shareable referral link (e.g., `https://platform.com?ref=ABC123XYZ`)
- Display referral statistics:
  - Total referrals made
  - Active referrals (users with active premium)
  - Total commissions earned
  - Pending commissions

### Referral History
- List of all referred users
- Premium purchase status of each referee
- Commission earned per referral
- Commission payment date

---

## Backend Implementation

### Procedures Required
1. `generateReferralCode()` - Generate unique alphanumeric code
2. `assignReferralCode(userId)` - Assign code to new user
3. `validateReferralCode(code)` - Verify code exists and is valid
4. `createReferral(referrerId, refereeId, code)` - Create referral record
5. `awardCommission(referralId, amount)` - Award commission to referrer
6. `getReferralStats(userId)` - Get referral statistics for user
7. `getReferralHistory(userId)` - Get list of referred users

### Database Triggers/Jobs
- Monitor premium purchase events
- Automatically award commission when premium purchase ≥1 month is detected
- Create transaction records for audit trail

---

## Security Considerations

1. **Code Uniqueness:** Enforce unique constraint on `referralCode` column
2. **Commission Integrity:** Prevent duplicate commission awards for same purchase
3. **Audit Trail:** Log all commission transactions in `energyCoreTransactions`
4. **Fraud Prevention:** Validate referral relationships before awarding commission

---

## Future Enhancements

- Tiered commission structure (higher commission for multiple referrals)
- Referral bonuses for referees
- Referral contests with leaderboards
- Affiliate program for content creators
- Commission withdrawal/payout system

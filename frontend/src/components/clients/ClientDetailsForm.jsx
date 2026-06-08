import * as PhoneUtils from "../../utils/phone-utils.js";

function ClientDetailsForm({form, errors, onChange, onPhoneChange, onSubmit, submitLabel = 'Save'}) {
    return (
        <form onSubmit={onSubmit} className="client-form">
            {errors.trainerId && <div className="field-error"> * {errors.trainerId}</div>}
            <div className="form-field">
                <label>First Name</label>
                <input name="firstName"
                       className={errors.firstName ? 'input-error' : ''}
                       value={form.firstName}
                       onChange={onChange}
                />
            </div>
            {errors.firstName && <div className="field-error"> * {errors.firstName}</div>}
            <div className="form-field">
                <label>Last Name</label>
                <input name="lastName"
                       className={errors.lastName ? 'input-error' : ''}
                       value={form.lastName}
                       onChange={onChange}
                />
                {errors.lastName && <div className="field-error"> * {errors.lastName}</div>}
            </div>
            <div className="form-field">
                <label>Preferred Name</label>
                <input name="preferredName"
                       placeholder={"Optional"}
                       value={form.preferredName}
                       onChange={onChange}
                />
            </div>

            <div className="section-divider spaced" />

            <div className="form-field">
                <label>Phone</label>
                <input
                    name="phone"
                    inputMode="tel"
                    placeholder="Digits only"
                    className={errors.phone ? 'input-error' : ''}
                    value={form.phone}
                    onChange={(event) => {
                        const phone = PhoneUtils.formatPhoneFromDigits(event.target.value);
                        if (onPhoneChange) {
                            onPhoneChange(phone);
                        }
                    }}
                />
                {errors.phone && <div className="field-error">* {errors.phone}</div>}
            </div>
            <div className="form-field">
                <label>Email</label>
                <input name="email"
                       className={errors.email ? 'input-error' : ''}
                       value={form.email}
                       onChange={onChange}
                />
                {errors.email && <div className="field-error"> * {errors.email}</div>}
            </div>

            <div className="section-divider spaced" />

            <div className="form-field">
                <label>Birth Date</label>
                <input name="birthDate"
                       className={errors.birthDate ? 'input-error' : ''}
                       type="date"
                       value={form.birthDate}
                       onChange={onChange}
                />
                {errors.birthDate && <div className="field-error"> * {errors.birthDate}</div>}
            </div>
            <div className="form-field">
                <label>Gender</label>
                <select
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="UNDISCLOSED">Prefer not to say</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <div className="form-actions">
                <button type="submit">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

export default ClientDetailsForm;
import { TemplateRenderer } from './domain/template-renderer.js';
import { MockEmailProvider } from './infrastructure/mock-email.provider.js';
import { ResendEmailProvider } from './infrastructure/resend-email.provider.js';
import { SendEmailUseCase } from './application/send-email.usecase.js';
import { SubmitPublicFormUseCase } from '../Forms/application/submit-public-form.usecase.js';
import type { FormsRepository } from '../Forms/domain/forms.repository.js';
import type { FormFieldsRepository } from '../Forms/domain/form-fields.repository.js';
import type { FormSubmissionsRepository } from '../Forms/domain/form-submissions.repository.js';
import type { ContactsRepository } from '../Forms/domain/contacts.repository.js';
import type { EmailTemplatesRepository } from '../EmailTemplates/domain/email-templates.repository.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ PASS: ${testName}`);
    } else {
        console.error(`  ❌ FAIL: ${testName}`);
        throw new Error(`Assertion failed: ${testName}`);
    }
}

async function runTests() {
    console.log('\n🧪 ========================================================');
    console.log('🧪 RUNNING EMAIL MODULE & RESEND INTEGRATION TESTS');
    console.log('🧪 ========================================================\n');

    // -------------------------------------------------------------------------
    // 1. TemplateRenderer Tests
    // -------------------------------------------------------------------------
    console.log('📦 [1/4] Testing TemplateRenderer:');

    const simpleData = {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        phone: '+503 7777-8888',
        message: 'Hola, quiero cotizar un servicio web.',
    };

    const renderedSubject = TemplateRenderer.render('New contact from {{name}} ({{email}})', simpleData);
    assert(
        renderedSubject === 'New contact from Juan Pérez (juan.perez@example.com)',
        'Interpolates basic subject variables correctly'
    );

    const renderedWithSpaces = TemplateRenderer.render('Hello {{  name  }}, phone: {{ phone }}', simpleData);
    assert(
        renderedWithSpaces === 'Hello Juan Pérez, phone: +503 7777-8888',
        'Handles variable syntax with whitespace inside braces'
    );

    const renderedCaseInsensitive = TemplateRenderer.render('Name: {{NAME}}, Email: {{EMAIL}}', simpleData);
    assert(
        renderedCaseInsensitive === 'Name: Juan Pérez, Email: juan.perez@example.com',
        'Handles case-insensitive token mapping'
    );

    const renderedMissing = TemplateRenderer.render('Name: {{name}}, Address: {{address}}, Country: {{country}}', simpleData);
    assert(
        renderedMissing === 'Name: Juan Pérez, Address: , Country: ',
        'Replaces unsupplied / missing variables with empty strings'
    );

    const complexHtml = '<p>Name: <strong>{{name}}</strong></p><p>Message: {{message}}</p>';
    const renderedHtml = TemplateRenderer.render(complexHtml, simpleData);
    assert(
        renderedHtml === '<p>Name: <strong>Juan Pérez</strong></p><p>Message: Hola, quiero cotizar un servicio web.</p>',
        'Interpolates HTML body content without modifying markup'
    );

    // -------------------------------------------------------------------------
    // 2. Email Providers Tests (Mock & Resend)
    // -------------------------------------------------------------------------
    console.log('\n📦 [2/4] Testing Email Providers:');

    const mockProvider = new MockEmailProvider();
    const sendResult = await mockProvider.sendEmail({
        to: 'admin@example.com',
        subject: 'Test Subject',
        html: '<p>Hello world</p>',
    });

    assert(sendResult.success === true, 'MockEmailProvider sends email successfully');
    assert(mockProvider.sentEmails.length === 1, 'MockEmailProvider records sent emails in memory');
    assert(mockProvider.sentEmails[0].to === 'admin@example.com', 'Recorded email has correct recipient');

    // Simulate provider failure
    mockProvider.shouldFail = true;
    const failedResult = await mockProvider.sendEmail({
        to: 'fail@example.com',
        subject: 'Fail Subject',
        html: '<p>Should fail</p>',
    });
    assert(failedResult.success === false, 'MockEmailProvider simulates failure correctly');
    assert(failedResult.error === 'Simulated email provider failure', 'Returns simulated failure error message');

    // Resend Provider initialization test (safe without key in local unit test)
    const safeResend = new ResendEmailProvider('mock_dummy_key_for_test', 'noreply@example.com');
    assert(safeResend instanceof ResendEmailProvider, 'ResendEmailProvider instantiates safely with custom key');

    // -------------------------------------------------------------------------
    // 3. SendEmailUseCase Tests
    // -------------------------------------------------------------------------
    console.log('\n📦 [3/4] Testing SendEmailUseCase:');

    mockProvider.clear();
    const sendEmailUseCase = new SendEmailUseCase(mockProvider);

    const useCaseResult = await sendEmailUseCase.execute({
        to: ['dest1@example.com', 'dest2@example.com'],
        subject: 'Urgent Notification',
        html: '<h1>System Alert</h1>',
    });

    assert(useCaseResult.success === true, 'SendEmailUseCase executes successfully');
    assert(mockProvider.sentEmails.length === 1, 'Dispatches email through injected provider');

    // Validation errors
    try {
        await sendEmailUseCase.execute({
            to: [],
            subject: 'No recipient',
            html: '<p>test</p>',
        });
        assert(false, 'Should throw error when recipient list is empty');
    } catch (err: any) {
        assert(err.code === 'INVALID_RECIPIENT', 'Rejects empty recipient list with INVALID_RECIPIENT');
    }

    try {
        await sendEmailUseCase.execute({
            to: 'admin@example.com',
            subject: '',
            html: '<p>test</p>',
        });
        assert(false, 'Should throw error when subject is empty');
    } catch (err: any) {
        assert(err.code === 'INVALID_SUBJECT', 'Rejects empty subject with INVALID_SUBJECT');
    }

    // -------------------------------------------------------------------------
    // 4. SubmitPublicFormUseCase Email Integration Tests
    // -------------------------------------------------------------------------
    console.log('\n📦 [4/4] Testing SubmitPublicFormUseCase Email Notifications:');

    mockProvider.clear();

    const mockForm = {
        id: 'form-123',
        websiteId: 'website-abc',
        name: 'Contact Form',
        slug: 'contact',
        sendEmail: true,
        emailFrom: 'notificaciones@website-abc.com',
        recipientEmails: ['sales@example.com', 'leads@example.com'],
        emailTemplateId: 'template-xyz',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockTemplate = {
        id: 'template-xyz',
        websiteId: 'website-abc',
        name: 'Lead Notification',
        subject: 'New Lead: {{name}}',
        htmlContent: '<p>User {{name}} ({{email}}) sent a message: {{message}}</p>',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockFormsRepo: Partial<FormsRepository> = {
        findBySlug: async (wId, slug) => (wId === 'website-abc' && slug === 'contact' ? (mockForm as any) : null),
    };

    const mockFieldsRepo: Partial<FormFieldsRepository> = {
        listByFormId: async () => [
            { id: 'f1', formId: 'form-123', label: 'Name', key: 'name', type: 'STRING', isRequired: true, createdAt: new Date() },
            { id: 'f2', formId: 'form-123', label: 'Email', key: 'email', type: 'STRING', isRequired: true, createdAt: new Date() },
            { id: 'f3', formId: 'form-123', label: 'Message', key: 'message', type: 'TEXT', isRequired: true, createdAt: new Date() },
        ],
    };

    const mockSubmissionsRepo: Partial<FormSubmissionsRepository> = {
        create: async (data) => ({
            id: 'sub-001',
            formId: data.formId,
            contactId: data.contactId,
            data: data.data,
            status: data.status,
            createdAt: new Date(),
        }),
    };

    const mockContactsRepo: Partial<ContactsRepository> = {
        findOrCreate: async (data) => ({
            id: 'contact-001',
            websiteId: data.websiteId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    };

    const mockTemplatesRepo: Partial<EmailTemplatesRepository> = {
        findById: async (id) => (id === 'template-xyz' ? (mockTemplate as any) : null),
    };

    const submitPublicFormUseCase = new SubmitPublicFormUseCase(
        mockFormsRepo as FormsRepository,
        mockFieldsRepo as FormFieldsRepository,
        mockSubmissionsRepo as FormSubmissionsRepository,
        mockContactsRepo as ContactsRepository,
        mockTemplatesRepo as EmailTemplatesRepository,
        mockProvider
    );

    // Scenario A: Successful submission with email dispatch
    const subA = await submitPublicFormUseCase.execute({
        websiteId: 'website-abc',
        slug: 'contact',
        payload: {
            name: 'Carlos Santana',
            email: 'carlos@example.com',
            message: 'Me gustaría agendar una demostración.',
        },
    });

    assert(subA.id === 'sub-001', 'Form submission created successfully');
    assert(mockProvider.sentEmails.length === 1, 'Email notification dispatched upon form submission');
    assert(
        mockProvider.sentEmails[0].from === 'notificaciones@website-abc.com',
        'Email from sender address matches configured emailFrom'
    );
    assert(
        mockProvider.sentEmails[0].subject === 'New Lead: Carlos Santana',
        'Email subject was interpolated with submission data'
    );
    assert(
        mockProvider.sentEmails[0].html.includes('User Carlos Santana (carlos@example.com) sent a message: Me gustaría agendar una demostración.'),
        'Email HTML content was interpolated with submission data'
    );
    assert(
        Array.isArray(mockProvider.sentEmails[0].to) &&
        mockProvider.sentEmails[0].to.includes('sales@example.com') &&
        mockProvider.sentEmails[0].to.includes('leads@example.com'),
        'Email sent to all configured recipientEmails'
    );

    // Scenario B: sendEmail = false does NOT send emails
    mockProvider.clear();
    mockForm.sendEmail = false;

    await submitPublicFormUseCase.execute({
        websiteId: 'website-abc',
        slug: 'contact',
        payload: {
            name: 'Carlos Santana',
            email: 'carlos@example.com',
            message: 'Prueba sin email.',
        },
    });

    assert(mockProvider.sentEmails.length === 0, 'No email is dispatched when sendEmail is false');

    // Scenario C: EmailTemplate belonging to another website is blocked
    mockProvider.clear();
    mockForm.sendEmail = true;
    mockTemplate.websiteId = 'another-website-xyz'; // Website mismatch

    await submitPublicFormUseCase.execute({
        websiteId: 'website-abc',
        slug: 'contact',
        payload: {
            name: 'Carlos Santana',
            email: 'carlos@example.com',
            message: 'Prueba website mismatch.',
        },
    });

    assert(mockProvider.sentEmails.length === 0, 'Security: Email is aborted if EmailTemplate belongs to another website');

    // Restore website match
    mockTemplate.websiteId = 'website-abc';

    // Scenario D: Provider failure does NOT delete or crash the submission
    mockProvider.clear();
    mockProvider.shouldFail = true;

    const subD = await submitPublicFormUseCase.execute({
        websiteId: 'website-abc',
        slug: 'contact',
        payload: {
            name: 'Carlos Santana',
            email: 'carlos@example.com',
            message: 'Prueba con proveedor caído.',
        },
    });

    assert(subD.id === 'sub-001', 'Submission is preserved even when email provider fails');

    console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!\n`);
}

runTests().catch((err) => {
    console.error('❌ Test suite execution failed:', err);
    process.exit(1);
});

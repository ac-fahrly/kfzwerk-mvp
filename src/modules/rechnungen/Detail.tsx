import { Download, Pencil, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/status-badge';
import { Money } from '@/components/shared/money';
import { DateCell } from '@/components/shared/date-cell';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n';
import { saveInvoicePdf } from '@/lib/pdf';
import { toast } from '@/store/toast-store';
import { customerById, vehicleById } from '@/modules/shared/customers';
import type { BusinessSettings } from '@/modules/settings/types';
import { offenerBetrag, type Rechnung } from './types';

type Props = { r: Rechnung; onEdit?: () => void; onDismiss?: () => void };

export function RechnungDetail({ r, onEdit, onDismiss }: Props) {
  const { t } = useT('rechnungen');
  const { t: tc } = useT('common');
  // The on-screen header still links the LIVE customer — that link is
  // navigation, not part of the document.
  const kunde = customerById(r.customerId);
  const fahrzeug = r.vehicleId ? vehicleById(r.vehicleId) : undefined;
  // The document itself reads only the server's snapshot, so print and PDF say
  // the same thing and neither changes when the customer or the profile does.
  const billTo = r.empfaenger;
  const absender = r.absender;
  // Without a sender the document is not an invoice (§14 UStG makes the
  // issuer's name mandatory), so both exports are blocked rather than silently
  // producing a page with no letterhead and no bank details. Also covers the
  // brief window where an optimistic row has not round-tripped yet and carries
  // no snapshot at all.
  const hasLetterhead = Boolean(absender?.name);

  function handleSavePdf() {
    try {
      saveInvoicePdf({
        r,
        vehicle: fahrzeug,
        labels: {
          title: t('detail.title'),
          number: t('detail.number'),
          invoiceDate: t('detail.invoiceDate'),
          dueDate: t('detail.faellig'),
          billTo: t('detail.invoiceTo'),
          vehicle: t('detail.vehicle'),
          total: t('detail.gesamt'),
          paid: t('detail.paid'),
          open: t('detail.openAmount'),
          note: t('detail.note'),
          ustId: t('detail.ustId'),
          steuernummer: t('detail.steuernummer'),
          iban: t('detail.iban'),
          bic: t('detail.bic'),
          bank: t('detail.bank'),
          page: (current, total) => t('detail.pageOf', { current, total }),
        },
      });
    } catch {
      toast.error(t('detail.pdfFailed'));
    }
  }

  return (
    <div className="print-area space-y-4">
      {!hasLetterhead ? (
        <div className="no-print text-xs text-muted-foreground">
          {t('detail.noLetterhead')}{' '}
          <Link to="/settings" onClick={() => onDismiss?.()} className="text-primary hover:underline">
            {tc('nav.settings')}
          </Link>
        </div>
      ) : null}

      {/* Letterhead — print only, and fed by the same snapshot the PDF draws
          from, so `window.print()` and "Save as PDF" produce the same document
          instead of one with a sender and one without. */}
      {absender && hasLetterhead ? (
        <div className="hidden print:block">
          <div className="text-sm font-semibold">{absender.name}</div>
          {absender.strasse ? <div className="text-sm">{absender.strasse}</div> : null}
          {absender.plz || absender.ort ? (
            <div className="text-sm">{absender.plz} {absender.ort}</div>
          ) : null}
          {absender.land ? <div className="text-sm">{absender.land}</div> : null}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="num text-xs text-muted-foreground">{r.nummer}</div>
          {kunde ? (
            <Link
              to={`/kunden/${kunde.id}`}
              onClick={() => onDismiss?.()}
              className="mt-1 block text-lg font-semibold text-primary hover:underline"
            >
              {kunde.name}
            </Link>
          ) : (
            <div className="mt-1 text-lg font-semibold">—</div>
          )}
          {fahrzeug ? (
            <div className="text-sm text-muted-foreground">
              <span className="num">{fahrzeug.kennzeichen}</span> · {fahrzeug.hersteller} {fahrzeug.modell}
            </div>
          ) : null}
        </div>
        <div className="no-print flex items-center gap-2">
          <StatusBadge status={r.status} />
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil size={14} />
              {tc('actions.edit')}
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            disabled={!hasLetterhead}
            title={hasLetterhead ? undefined : t('detail.exportBlocked')}
            onClick={() => window.print()}
          >
            <Printer size={14} />
            {t('detail.print')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasLetterhead}
            title={hasLetterhead ? undefined : t('detail.exportBlocked')}
            onClick={handleSavePdf}
          >
            <Download size={14} />
            {t('detail.savePdf')}
          </Button>
        </div>
      </div>

      {billTo ? (
        <div className="hidden print:block">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{t('detail.invoiceTo')}</div>
          <div className="mt-1 text-sm">
            <div>{billTo.name}</div>
            {billTo.strasse ? <div>{billTo.strasse}</div> : null}
            {billTo.plz || billTo.ort ? <div>{billTo.plz} {billTo.ort}</div> : null}
            {billTo.ustId ? (
              <div className="num">{t('detail.ustId')} {billTo.ustId}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 rounded-md border p-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.invoiceDate')}</div>
          <DateCell value={r.datum} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.faellig')}</div>
          <DateCell value={r.faelligDatum} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.gesamt')}</div>
          <div className="text-right"><Money value={r.betrag} /></div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('detail.paid')}</div>
          <div className="text-right"><Money value={r.bezahltBetrag} /></div>
        </div>
        <div className="col-span-2 border-t pt-3">
          <div className="text-xs text-muted-foreground">{t('detail.openAmount')}</div>
          <div className="text-right text-lg font-semibold"><Money value={offenerBetrag(r)} /></div>
        </div>
      </div>

      {r.notiz ? (
        <div className="rounded-md border p-4 text-sm">
          <div className="mb-1 text-xs text-muted-foreground">{t('detail.note')}</div>
          {r.notiz}
        </div>
      ) : null}

      {absender && hasLetterhead ? <PrintFooter business={absender} /> : null}
    </div>
  );
}

/**
 * The mandatory small print — contact, tax ids, bank details — mirroring
 * `drawFooter` in `@/lib/pdf`. Print only: on screen the same facts live on the
 * Settings page, and repeating them under every invoice would be noise.
 */
function PrintFooter({ business }: { business: BusinessSettings }) {
  const { t } = useT('rechnungen');

  const contact = [
    business.name,
    business.strasse,
    `${business.plz} ${business.ort}`.trim(),
    business.email,
    business.telefon,
  ].filter(Boolean);

  const tax = [
    business.ustId ? `${t('detail.ustId')} ${business.ustId}` : '',
    business.steuernummer ? `${t('detail.steuernummer')} ${business.steuernummer}` : '',
  ].filter(Boolean);

  const bank = [
    business.bank ? `${t('detail.bank')} ${business.bank}` : '',
    business.iban ? `${t('detail.iban')} ${business.iban}` : '',
    business.bic ? `${t('detail.bic')} ${business.bic}` : '',
  ].filter(Boolean);

  return (
    <div className="hidden border-t pt-3 text-[10px] text-muted-foreground print:grid print:grid-cols-3 print:gap-4">
      <div>
        {contact.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <div>
        {tax.map((line) => (
          <div key={line} className="num">{line}</div>
        ))}
      </div>
      <div>
        {bank.map((line) => (
          <div key={line} className="num">{line}</div>
        ))}
      </div>
    </div>
  );
}

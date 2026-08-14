import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Users, Phone } from 'lucide-react';
import {
  useKisceFunds,
  useKisceManpower,
  useCentreContacts,
} from '@/hooks/useKisce';
import { KisceFundsBody, KisceStaffingBody } from './KisceSections';

interface Props {
  centreId: string;
}

/** Funds, staffing and (for signed-in users) contacts for a single centre. */
export const CentreKisceSections: React.FC<Props> = ({ centreId }) => {
  const { data: allFunds = [] } = useKisceFunds();
  const { data: allManpower = [] } = useKisceManpower();
  const { data: contacts = [] } = useCentreContacts(centreId);

  const funds = allFunds.filter((f) => f.kd_centre_id === centreId);
  const manpower = allManpower.filter((m) => m.kd_centre_id === centreId);

  const hasKisce = funds.length > 0 || manpower.length > 0;
  if (!hasKisce && contacts.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      {funds.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" /> KISCE funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KisceFundsBody rows={funds} />
          </CardContent>
        </Card>
      )}

      {manpower.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> KISCE staffing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KisceStaffingBody rows={manpower} />
          </CardContent>
        </Card>
      )}

      {contacts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" /> Centre contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contacts.map((c) => (
              <div key={c.map_facility_id} className="text-sm">
                {c.contact_info && <p className="font-medium">{c.contact_info}</p>}
                {c.contact_number && (
                  <p className="text-muted-foreground tabular-nums">{c.contact_number}</p>
                )}
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">
              Visible to signed-in users only
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

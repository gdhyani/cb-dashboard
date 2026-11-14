import { KeyRound, Power, ScrollText, UserCheck } from "lucide-react";
import { admin } from "../content";
import { RevokeDemo } from "./revoke-demo";

const ICONS = [UserCheck, Power, ScrollText, KeyRound];

/**
 * What admins control, beside a revoke demo told by scroll. Desktop pins the whole section (the track is tall, the
 * stage is a sticky full-height box); phones pin only the demo (see RevokeDemo).
 */
export function AdminControls() {
  return (
    <section id="security" className="lp-admin" data-tone="night" aria-labelledby="lp-admin-title">
      <div className="lp-admin__track" data-revoke-track="">
        <div className="lp-admin__stage">
          <div className="lp-grid lp-admin__inner">
            <div className="lp-admin__copy">
              <h2 id="lp-admin-title" className="lp-h2" data-split="">
                {admin.title}
              </h2>
              <p className="lp-admin__intro" data-reveal="">
                {admin.intro}
              </p>
              <dl className="lp-admin__controls" data-reveal="stagger">
                {admin.controls.map((c, i) => {
                  const Icon = ICONS[i] ?? KeyRound;
                  return (
                    <div key={c.name} className="lp-card lp-admin__control" data-spotlight="">
                      <dt>
                        <span className="lp-icon" aria-hidden="true">
                          <Icon size={16} strokeWidth={1.75} />
                        </span>
                        {c.name}
                      </dt>
                      <dd>{c.text}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            <div className="lp-admin__demo">
              <div className="lp-admin__demo-stage">
                <RevokeDemo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

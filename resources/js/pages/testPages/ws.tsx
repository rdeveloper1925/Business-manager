import { Head } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

import { emit, show } from '@/actions/App/Http/Controllers/TestPages/WebsocketTestController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getEcho } from '@/echo';
import { dashboard } from '@/routes';

type WsMessagePayload = {
    message: string;
    sent_at: string;
    sender: string;
};

const CHANNEL = 'tests.ws';
const EVENT = '.tests.ws.message';

export default function WebsocketTestPage() {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [items, setItems] = useState<WsMessagePayload[]>([]);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        const echo = getEcho();

        if (echo === null) {
            setConnectionError(
                'Echo is not configured. Set the VITE_REVERB_* variables and run Reverb.',
            );
            return;
        }

        const channel = echo.channel(CHANNEL);
        channel.listen(EVENT, (payload: WsMessagePayload) => {
            setItems((current) => [payload, ...current].slice(0, 20));
        });

        return () => {
            channel.stopListening(EVENT);
            echo.leaveChannel(CHANNEL);
        };
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (message.trim() === '') {
            return;
        }

        setSending(true);

        try {
            const response = await fetch(emit.url(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ message }),
            });

            if (response.ok) {
                setMessage('');
                return;
            }

            setConnectionError('Unable to send message. Check app logs for details.');
        } catch {
            setConnectionError('Request failed. Verify app/reverb services are running.');
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <Head title="WebSocket test page" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        WebSocket test page
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        This page listens on <code>{CHANNEL}</code>. Use the form
                        below to broadcast a message from server to client through
                        Reverb.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Emit message</CardTitle>
                        <CardDescription>
                            Submitting calls <code>{emit.url()}</code> which
                            dispatches a broadcast event.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex gap-2" onSubmit={submit}>
                            <Input
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                placeholder="Type a message"
                                maxLength={200}
                                disabled={sending}
                            />
                            <Button type="submit" disabled={sending}>
                                {sending ? 'Sending...' : 'Send'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {connectionError !== null && (
                    <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                        {connectionError}
                    </p>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Received messages</CardTitle>
                        <CardDescription>
                            New events are prepended in real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {items.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                No events received yet.
                            </p>
                        )}
                        {items.map((item, index) => (
                            <div
                                key={`${item.sent_at}-${index}`}
                                className="rounded-md border p-3 text-sm"
                            >
                                <div className="font-medium">{item.message}</div>
                                <div className="text-muted-foreground mt-1 text-xs">
                                    {item.sender} - {item.sent_at}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

WebsocketTestPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'WebSocket test', href: show.url() },
    ],
};

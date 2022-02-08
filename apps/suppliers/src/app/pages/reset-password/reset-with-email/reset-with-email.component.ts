import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-with-email',
  templateUrl: './reset-with-email.component.html',
  styleUrls: ['./reset-with-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetWithEmailComponent implements OnInit {
  email: string;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    // Takes phone number from route
    this.email = this.activatedRoute.snapshot.params.email;
  }
}

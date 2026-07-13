import { Component, ElementRef, EventEmitter, HostListener, Input, Output, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css']
})
export class SearchBarComponent {
  @Input() location = '';
  @Output() locationChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  suggestions: any[] = [];
  showDrop = false;
  highlighted = -1;
  busy = false;
  private debounceRef: any = null;
  private baseUrl = isDevMode() ? 'http://localhost:5000/api/weather' : '/api/weather';

  constructor(private http: HttpClient, private eRef: ElementRef) {}

  @HostListener('document:mousedown', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDrop = false;
    }
  }

  fetchSuggestions(query: string) {
    clearTimeout(this.debounceRef);
    if (query.trim().length < 2) {
      this.suggestions = [];
      this.showDrop = false;
      return;
    }
    this.debounceRef = setTimeout(() => {
      this.http.get<any[]>(`${this.baseUrl}/geo?query=${encodeURIComponent(query)}`).subscribe({
        next: (data) => {
          const seen = new Set();
          const unique = data.filter(c => {
            const key = `${c.name}-${c.country}-${c.state || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          this.suggestions = unique;
          this.showDrop = unique.length > 0;
          this.highlighted = -1;
        },
        error: () => {
          this.suggestions = [];
          this.showDrop = false;
        }
      });
    }, 280);
  }

  pickSuggestion(city: any) {
    const label = city.state
      ? `${city.name}, ${city.state}, ${city.country}`
      : `${city.name}, ${city.country}`;
    
    this.location = label;
    this.locationChange.emit(this.location);
    this.suggestions = [];
    this.showDrop = false;
    this.highlighted = -1;
    
    this.search.emit(`${city.lat},${city.lon}`);
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.showDrop || this.suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlighted = Math.min(this.highlighted + 1, this.suggestions.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlighted = Math.max(this.highlighted - 1, -1);
    } else if (e.key === 'Enter' && this.highlighted >= 0) {
      e.preventDefault();
      this.pickSuggestion(this.suggestions[this.highlighted]);
    } else if (e.key === 'Escape') {
      this.showDrop = false;
      this.highlighted = -1;
    }
  }

  handleChange(value: string) {
    this.location = value;
    this.locationChange.emit(this.location);
    this.fetchSuggestions(value);
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    if (this.busy || !this.location.trim()) return;
    this.showDrop = false;
    this.busy = true;
    this.search.emit(this.location.trim());
    
    // In Angular we reset busy from parent or use an input if needed.
    // For simplicity we will unset busy after 1 second if no feedback.
    setTimeout(() => this.busy = false, 1000); 
  }

  clearSearch() {
    this.location = '';
    this.locationChange.emit(this.location);
    this.suggestions = [];
    this.showDrop = false;
  }
}
